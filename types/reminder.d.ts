export type ReminderType = 'daily' | 'weekly';

export type ReminderPreset = 'wird' | 'mulk' | 'kahf' | 'custom';

export type Reminder = {
  /** Unique identifier for the reminder */
  id: string;
  /** Display title (Arabic) */
  title: string;
  /** Whether the reminder is currently active */
  enabled: boolean;
  /** Hour (0-23) */
  hour: number;
  /** Minute (0-59) */
  minute: number;
  /** Repeat frequency */
  type: ReminderType;
  /** Day of week for weekly reminders (1=Sunday, 6=Friday, 7=Saturday) */
  dayOfWeek?: number;
  /** Scheduled notification identifier from expo-notifications */
  notificationId?: string;
  /** Preset identifier — presets cannot be deleted */
  preset: ReminderPreset;
  /** Notification body text */
  body?: string;
};
