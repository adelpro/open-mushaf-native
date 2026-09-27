import type { Reminder } from '@/types/reminder';

interface DailyWirdProgress {
  value: number;
  date: string;
}

/**
 * Adds the follow-up Wird preset for users whose persisted reminders were
 * created before the second daily Wird reminder existed.
 */
export function ensureWirdFollowUpReminder(
  reminders: Reminder[],
  followUpReminder: Reminder,
): Reminder[] {
  if (reminders.some((reminder) => reminder.id === followUpReminder.id)) {
    return reminders;
  }

  const startReminderIndex = reminders.findIndex(
    (reminder) => reminder.id === 'preset-wird',
  );

  if (startReminderIndex === -1) {
    return [followUpReminder, ...reminders];
  }

  return [
    ...reminders.slice(0, startReminderIndex + 1),
    followUpReminder,
    ...reminders.slice(startReminderIndex + 1),
  ];
}

/**
 * Returns whether today's tracked Wird has reached or exceeded the configured
 * daily goal.
 */
export function isWirdCompletedToday(
  progress: DailyWirdProgress,
  goal: number,
  today = new Date().toDateString(),
): boolean {
  return goal > 0 && progress.date === today && progress.value >= goal;
}

export const WIRD_NOTIFICATION_PREFIX = 'wird_';
// Wird notifications are one-off so today's remaining occurrences can be
// cancelled independently. The root sync hook refreshes this rolling window
// whenever the app becomes active.
export const WIRD_SCHEDULE_DAYS = 14;

export interface WirdScheduleEntry {
  identifier: string;
  reminder: Reminder;
  date: Date;
  dateKey: string;
}

/** Returns a stable local-calendar key without converting through UTC. */
export function getLocalDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}${month}${day}`;
}

/** Builds the deterministic notification identifier for one Wird occurrence. */
export function getWirdNotificationIdentifier(
  reminderId: string,
  date: Date,
): string {
  const hour = String(date.getHours()).padStart(2, '0');
  const minute = String(date.getMinutes()).padStart(2, '0');

  return `${WIRD_NOTIFICATION_PREFIX}${reminderId}_${getLocalDateKey(date)}_${hour}${minute}`;
}

/**
 * Builds one-off notification occurrences for enabled Wird reminders.
 *
 * Today's occurrences are omitted after the Wird has been completed and
 * already-passed times are never scheduled. Future days remain scheduled so
 * completing today's Wird does not disable later reminders.
 */
export function buildWirdSchedule(
  reminders: Reminder[],
  completedToday: boolean,
  now = new Date(),
  days = WIRD_SCHEDULE_DAYS,
): WirdScheduleEntry[] {
  if (days <= 0) return [];

  const entries: WirdScheduleEntry[] = [];

  reminders
    .filter((reminder) => reminder.preset === 'wird' && reminder.enabled)
    .forEach((reminder) => {
      for (let dayOffset = 0; dayOffset < days; dayOffset += 1) {
        if (dayOffset === 0 && completedToday) continue;

        const date = new Date(now);
        date.setHours(0, 0, 0, 0);
        date.setDate(date.getDate() + dayOffset);
        date.setHours(reminder.hour, reminder.minute, 0, 0);

        if (date.getTime() <= now.getTime()) continue;

        entries.push({
          identifier: getWirdNotificationIdentifier(reminder.id, date),
          reminder,
          date,
          dateKey: getLocalDateKey(date),
        });
      }
    });

  return entries;
}
