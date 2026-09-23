import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { Reminder } from '@/types/reminder';

import { syncReminders, syncWirdReminders } from '../notifications';

const expoNotifications = vi.hoisted(() => ({
  cancelScheduledNotificationAsync: vi.fn(),
  getAllScheduledNotificationsAsync: vi.fn(),
  getPermissionsAsync: vi.fn(),
  scheduleNotificationAsync: vi.fn(),
  setNotificationChannelAsync: vi.fn(),
}));

vi.mock('react-native', () => ({
  Platform: { OS: 'android' },
}));

vi.mock('expo-notifications', () => ({
  ...expoNotifications,
  AndroidImportance: {
    HIGH: 'high',
  },
  SchedulableTriggerInputTypes: {
    DAILY: 'daily',
    WEEKLY: 'weekly',
    DATE: 'date',
  },
}));

const startReminder: Reminder = {
  id: 'preset-wird',
  title: 'الورد اليومي',
  body: 'حان وقت قراءة وردك اليومي',
  enabled: true,
  hour: 20,
  minute: 0,
  type: 'daily',
  preset: 'wird',
};

const followUpReminder: Reminder = {
  id: 'preset-wird-follow-up',
  title: 'متابعة الورد اليومي',
  body: 'لم تُكمل وردك اليومي بعد، يمكنك المتابعة الآن',
  enabled: true,
  hour: 22,
  minute: 0,
  type: 'daily',
  preset: 'wird',
};

const mulkReminder: Reminder = {
  id: 'preset-mulk',
  title: 'سورة الملك',
  enabled: true,
  hour: 21,
  minute: 0,
  type: 'daily',
  preset: 'mulk',
};

describe('syncWirdReminders', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    expoNotifications.getAllScheduledNotificationsAsync.mockResolvedValue([]);
    expoNotifications.getPermissionsAsync.mockResolvedValue({
      status: 'granted',
    });
    expoNotifications.cancelScheduledNotificationAsync.mockResolvedValue(
      undefined,
    );
    expoNotifications.setNotificationChannelAsync.mockResolvedValue(undefined);
    expoNotifications.scheduleNotificationAsync.mockImplementation(
      async ({ identifier }: { identifier?: string }) =>
        identifier ?? 'generated-id',
    );
  });

  it('replaces legacy and managed Wird schedules with one-off occurrences', async () => {
    expoNotifications.getAllScheduledNotificationsAsync.mockResolvedValue([
      {
        identifier: 'wird_old_managed_request',
      },
      {
        identifier: 'unrelated-notification',
      },
    ]);

    const legacyStart = {
      ...startReminder,
      notificationId: 'legacy-recurring-wird',
    };

    const now = new Date(2026, 8, 23, 19, 0, 0);

    const result = await syncWirdReminders(
      [legacyStart, followUpReminder, mulkReminder],
      false,
      now,
      2,
    );

    expect(
      expoNotifications.cancelScheduledNotificationAsync,
    ).toHaveBeenCalledWith('legacy-recurring-wird');
    expect(
      expoNotifications.cancelScheduledNotificationAsync,
    ).toHaveBeenCalledWith('wird_old_managed_request');
    expect(
      expoNotifications.cancelScheduledNotificationAsync,
    ).not.toHaveBeenCalledWith('unrelated-notification');

    expect(expoNotifications.scheduleNotificationAsync).toHaveBeenCalledTimes(
      4,
    );

    expect(result[0].notificationId).toBeUndefined();
    expect(result[2]).toEqual(mulkReminder);
  });

  it('does not schedule another notification for today after completion', async () => {
    const now = new Date(2026, 8, 23, 19, 0, 0);

    await syncWirdReminders([startReminder, followUpReminder], true, now, 2);

    const requests = expoNotifications.scheduleNotificationAsync.mock.calls.map(
      ([request]) => request,
    );

    expect(requests).toHaveLength(2);
    expect(
      requests.every((request) => request.content.data.dateKey === '20260924'),
    ).toBe(true);
  });

  it('uses deterministic identifiers and DATE triggers', async () => {
    const now = new Date(2026, 8, 23, 19, 0, 0);

    await syncWirdReminders([startReminder], false, now, 1);

    expect(expoNotifications.scheduleNotificationAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        identifier: 'wird_preset-wird_20260923_2000',
        trigger: expect.objectContaining({
          type: 'date',
          date: new Date(2026, 8, 23, 20, 0, 0),
        }),
      }),
    );
  });

  it('does not schedule when notification permission is unavailable', async () => {
    expoNotifications.getPermissionsAsync.mockResolvedValue({
      status: 'denied',
    });

    const legacyStart = {
      ...startReminder,
      notificationId: 'legacy-recurring-wird',
    };

    const result = await syncWirdReminders(
      [legacyStart, followUpReminder],
      false,
      new Date(2026, 8, 23, 19, 0, 0),
      2,
    );

    expect(expoNotifications.scheduleNotificationAsync).not.toHaveBeenCalled();
    expect(result[0].notificationId).toBeUndefined();
  });

  it('keeps an already scheduled desired occurrence', async () => {
    expoNotifications.getAllScheduledNotificationsAsync.mockResolvedValue([
      {
        identifier: 'wird_preset-wird_20260923_2000',
      },
    ]);

    await syncWirdReminders(
      [startReminder],
      false,
      new Date(2026, 8, 23, 19, 0, 0),
      1,
    );

    expect(
      expoNotifications.cancelScheduledNotificationAsync,
    ).not.toHaveBeenCalled();

    expect(expoNotifications.scheduleNotificationAsync).not.toHaveBeenCalled();
  });
});

describe('syncReminders', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    expoNotifications.getAllScheduledNotificationsAsync.mockResolvedValue([]);
    expoNotifications.scheduleNotificationAsync.mockResolvedValue(
      'standard-reminder-id',
    );
  });

  it('leaves Wird reminders to the conditional Wird scheduler', async () => {
    const result = await syncReminders([startReminder, mulkReminder]);

    expect(expoNotifications.scheduleNotificationAsync).toHaveBeenCalledTimes(
      1,
    );

    expect(result[0]).toEqual(startReminder);
    expect(result[1].notificationId).toBe('standard-reminder-id');
  });
});
