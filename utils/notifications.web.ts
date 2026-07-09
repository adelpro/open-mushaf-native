/**
 * Web-only shim for {@link utils/notifications}.
 *
 * Metro picks this file (`*.web.ts`) over `utils/notifications.ts` when
 * bundling for web, so `expo-notifications` is never evaluated on web.
 * That sidesteps the dev warning
 *   `[expo-notifications] Listening to push token changes is not yet
 *    fully supported on web. Adding a listener will have no effect.`
 * which is emitted at module-load time by
 * `expo-notifications/build/DevicePushTokenAutoRegistration.fx.js`.
 *
 * Notifications are not supported on web, so every export here is a
 * type-correct no-op that matches the native module's surface.
 */

import type { Reminder } from '@/types/reminder';

/**
 * Native no-op. The Android notification channel is set up by
 * {@link setupNotificationChannel} on Android only; callers in
 * `app/_layout.tsx` already guard this with `Platform.OS !== 'web'`.
 */
export const setupNotificationChannel = async (): Promise<void> => {};

/**
 * Returns `false` because web cannot request notification permissions.
 * Callers in `app/(tabs)/(more)/reminders.tsx` short-circuit on web
 * before reaching this, so the user never sees the permission flow.
 */
export const requestNotificationPermissions = async (): Promise<boolean> =>
  false;

/**
 * Native no-op. Returns an empty-string id so the caller's typed
 * `notificationId` field stays valid. Nothing is actually scheduled;
 * the next `syncReminders` run on native will re-issue a real id.
 */
export const scheduleReminder = async (_reminder: Reminder): Promise<string> =>
  '';

/**
 * Native no-op. Nothing was scheduled on web, so there is nothing to
 * cancel.
 */
export const cancelReminder = async (
  _notificationId: string,
): Promise<void> => {};

/**
 * Native no-op. Nothing was scheduled on web.
 */
export const cancelAllReminders = async (): Promise<void> => {};

/**
 * Returns the input array unchanged; there is no scheduler to sync
 * against on web.
 */
export const syncReminders = async (
  reminders: Reminder[],
): Promise<Reminder[]> => reminders;
