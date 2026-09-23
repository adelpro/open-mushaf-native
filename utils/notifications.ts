import { Platform } from 'react-native';

import * as Notifications from 'expo-notifications';
import {
  DailyTriggerInput,
  SchedulableTriggerInputTypes,
  WeeklyTriggerInput,
} from 'expo-notifications';

import { Reminder } from '@/types/reminder';
import {
  buildWirdSchedule,
  WIRD_NOTIFICATION_PREFIX,
  WIRD_SCHEDULE_DAYS,
} from '@/utils/wirdReminders';

const CHANNEL_ID = 'quran-reminders';

/**
 * Sets up the Android notification channel.
 * Call once on app start to configure notification importance, sound, and visual indicators.
 *
 * @returns A promise that resolves when the channel configuration completes.
 */
export const setupNotificationChannel = async () => {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: 'تذكيرات القراءة',
      importance: Notifications.AndroidImportance.HIGH,
      sound: 'default',
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#1E5243',
    });
  }
};

/**
 * Requests notification permissions from the user.
 *
 * @returns A promise resolving to true if permissions are granted, false otherwise.
 */
export const requestNotificationPermissions = async (): Promise<boolean> => {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  if (existingStatus === 'granted') return true;

  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
};

/**
 * Schedules a local notification for a given reminder requirement.
 * Determines if the reminder is a daily or weekly trigger and registers it with the OS.
 *
 * @param reminder - The reminder object containing scheduling rules (time, intervals) and content.
 * @returns A promise resolving to the string ID of the scheduled notification.
 */
export const scheduleReminder = async (reminder: Reminder): Promise<string> => {
  let trigger: DailyTriggerInput | WeeklyTriggerInput;

  if (reminder.type === 'weekly') {
    trigger = {
      type: SchedulableTriggerInputTypes.WEEKLY,
      weekday: reminder.dayOfWeek ?? 6,
      hour: reminder.hour,
      minute: reminder.minute,
    };
  } else {
    trigger = {
      type: SchedulableTriggerInputTypes.DAILY,
      hour: reminder.hour,
      minute: reminder.minute,
    };
  }

  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title: reminder.title,
      body: reminder.body ?? 'حان وقت القراءة',
      sound: 'default',
      ...(Platform.OS === 'android' && {
        channelId: CHANNEL_ID,
      }),
    },
    trigger,
  });

  return notificationId;
};

/**
 * Cancels a single scheduled notification by its ID.
 *
 * @param notificationId - The exact string identifier returned when the notification was scheduled.
 * @returns A promise that resolves when the cancellation completes.
 */
export const cancelReminder = async (notificationId: string) => {
  await Notifications.cancelScheduledNotificationAsync(notificationId);
};

/**
 * Cancels all scheduled notifications active in the application.
 *
 * @returns A promise that resolves when all cancellations are complete.
 */
export const cancelAllReminders = async () => {
  await Notifications.cancelAllScheduledNotificationsAsync();
};

/**
 * Syncs the local application reminders state with actual OS scheduled notifications.
 * Re-schedules any enabled reminders that are missing from the OS scheduler.
 *
 * @param reminders - An array of reminder configurations from the application state.
 * @returns A promise resolving to the updated array of reminders, injecting any newly created notification IDs.
 */
export const syncReminders = async (
  reminders: Reminder[],
): Promise<Reminder[]> => {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  const scheduledIds = new Set(scheduled.map((n) => n.identifier));

  const updated: Reminder[] = [];

  for (const reminder of reminders) {
    // Wird reminders use individually cancellable one-off occurrences so
    // today's notifications can be suppressed after the daily goal is met.
    if (reminder.preset === 'wird') {
      updated.push(reminder);
      continue;
    }

    if (
      reminder.enabled &&
      (!reminder.notificationId || !scheduledIds.has(reminder.notificationId))
    ) {
      // Re-schedule missing notification
      try {
        const newId = await scheduleReminder(reminder);
        updated.push({ ...reminder, notificationId: newId });
      } catch (error) {
        console.error(
          `Failed to re-schedule reminder "${reminder.id}":`,
          error,
        );
        updated.push(reminder);
      }
    } else {
      updated.push(reminder);
    }
  }

  return updated;
};

/**
 * Reconciles scheduled Wird notifications with the current reminder settings.
 *
 * Wird occurrences are scheduled as one-off notifications instead of repeating
 * daily notifications. This lets the app cancel today's remaining occurrences
 * after the daily Wird has been completed without disabling future days.
 *
 * Existing legacy recurring Wird notification IDs are cancelled and removed
 * from persisted reminder state during the same reconciliation.
 */
export const syncWirdReminders = async (
  reminders: Reminder[],
  completedToday: boolean,
  now = new Date(),
  days = WIRD_SCHEDULE_DAYS,
): Promise<Reminder[]> => {
  if (Platform.OS === 'web') return reminders;

  const scheduled = await Notifications.getAllScheduledNotificationsAsync();

  const legacyIds = reminders.flatMap((reminder) =>
    reminder.preset === 'wird' && reminder.notificationId
      ? [reminder.notificationId]
      : [],
  );

  const desiredSchedule = buildWirdSchedule(
    reminders,
    completedToday,
    now,
    days,
  );
  const desiredIds = new Set(desiredSchedule.map((entry) => entry.identifier));

  const managedScheduledIds = scheduled
    .map((notification) => notification.identifier)
    .filter((identifier) => identifier.startsWith(WIRD_NOTIFICATION_PREFIX));

  const idsToCancel = new Set([
    ...legacyIds,
    ...managedScheduledIds.filter((identifier) => !desiredIds.has(identifier)),
  ]);

  for (const identifier of idsToCancel) {
    await cancelReminder(identifier);
  }

  const cleanedReminders =
    legacyIds.length > 0
      ? reminders.map((reminder) =>
          reminder.preset === 'wird' && reminder.notificationId
            ? { ...reminder, notificationId: undefined }
            : reminder,
        )
      : reminders;

  const { status } = await Notifications.getPermissionsAsync();

  if (status !== 'granted') {
    return cleanedReminders;
  }

  await setupNotificationChannel();

  const scheduledIds = new Set(
    scheduled.map((notification) => notification.identifier),
  );

  for (const entry of desiredSchedule) {
    if (scheduledIds.has(entry.identifier)) continue;

    await Notifications.scheduleNotificationAsync({
      identifier: entry.identifier,
      content: {
        title: entry.reminder.title,
        body: entry.reminder.body ?? 'حان وقت القراءة',
        sound: 'default',
        data: {
          reminderType: 'wird',
          reminderId: entry.reminder.id,
          dateKey: entry.dateKey,
        },
        ...(Platform.OS === 'android' && {
          channelId: CHANNEL_ID,
        }),
      },
      trigger: {
        type: SchedulableTriggerInputTypes.DATE,
        date: entry.date,
      },
    });
  }

  return cleanedReminders;
};
