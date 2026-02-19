import { Platform } from 'react-native';

import * as Notifications from 'expo-notifications';
import {
  DailyTriggerInput,
  SchedulableTriggerInputTypes,
  WeeklyTriggerInput,
} from 'expo-notifications';

import { Reminder } from '@/types/reminder';

const CHANNEL_ID = 'quran-reminders';

/** Sets up the Android notification channel. Call once on app start. */
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

/** Requests notification permissions from the user. Returns true if granted. */
export const requestNotificationPermissions = async (): Promise<boolean> => {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  if (existingStatus === 'granted') return true;

  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
};

/** Schedules a local notification for a reminder and returns the notification ID. */
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

/** Cancels a single scheduled notification by ID. */
export const cancelReminder = async (notificationId: string) => {
  await Notifications.cancelScheduledNotificationAsync(notificationId);
};

/** Cancels all scheduled notifications. */
export const cancelAllReminders = async () => {
  await Notifications.cancelAllScheduledNotificationsAsync();
};

/**
 * Syncs reminders state with actual scheduled notifications.
 * Re-schedules any enabled reminders that are missing from the OS scheduler.
 */
export const syncReminders = async (
  reminders: Reminder[],
): Promise<Reminder[]> => {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  const scheduledIds = new Set(scheduled.map((n) => n.identifier));

  const updated: Reminder[] = [];

  for (const reminder of reminders) {
    if (
      reminder.enabled &&
      (!reminder.notificationId || !scheduledIds.has(reminder.notificationId))
    ) {
      // Re-schedule missing notification
      const newId = await scheduleReminder(reminder);
      updated.push({ ...reminder, notificationId: newId });
    } else {
      updated.push(reminder);
    }
  }

  return updated;
};
