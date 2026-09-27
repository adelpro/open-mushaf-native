import { describe, expect, it } from 'vitest';

import type { Reminder } from '@/types/reminder';

import {
  buildWirdSchedule,
  ensureWirdFollowUpReminder,
  getLocalDateKey,
  getWirdNotificationIdentifier,
  isWirdCompletedToday,
} from '../wirdReminders';

const startReminder: Reminder = {
  id: 'preset-wird',
  title: 'الورد اليومي',
  enabled: true,
  hour: 20,
  minute: 0,
  type: 'daily',
  preset: 'wird',
};

const followUpReminder: Reminder = {
  id: 'preset-wird-follow-up',
  title: 'متابعة الورد اليومي',
  enabled: true,
  hour: 22,
  minute: 0,
  type: 'daily',
  preset: 'wird',
};

const mulkReminder: Reminder = {
  id: 'preset-mulk',
  title: 'سورة الملك',
  enabled: false,
  hour: 21,
  minute: 0,
  type: 'daily',
  preset: 'mulk',
};

describe('ensureWirdFollowUpReminder', () => {
  it('adds the follow-up immediately after the existing Wird preset', () => {
    const result = ensureWirdFollowUpReminder(
      [startReminder, mulkReminder],
      followUpReminder,
    );

    expect(result.map((reminder) => reminder.id)).toEqual([
      'preset-wird',
      'preset-wird-follow-up',
      'preset-mulk',
    ]);
  });

  it('does not duplicate an existing follow-up reminder', () => {
    const reminders = [startReminder, followUpReminder, mulkReminder];

    expect(ensureWirdFollowUpReminder(reminders, followUpReminder)).toBe(
      reminders,
    );
  });

  it('preserves existing custom and preset reminders', () => {
    const customReminder: Reminder = {
      id: 'custom-test',
      title: 'اختبار',
      enabled: false,
      hour: 9,
      minute: 0,
      type: 'daily',
      preset: 'custom',
    };

    const result = ensureWirdFollowUpReminder(
      [startReminder, customReminder, mulkReminder],
      followUpReminder,
    );

    expect(result).toContain(customReminder);
    expect(result).toContain(mulkReminder);
  });
});

describe('isWirdCompletedToday', () => {
  const today = 'Wed Sep 23 2026';

  it('returns true when progress reaches the daily goal', () => {
    expect(isWirdCompletedToday({ value: 2, date: today }, 2, today)).toBe(
      true,
    );
  });

  it('returns true when progress exceeds the daily goal', () => {
    expect(isWirdCompletedToday({ value: 2.5, date: today }, 2, today)).toBe(
      true,
    );
  });

  it('returns false when progress is below the daily goal', () => {
    expect(isWirdCompletedToday({ value: 1.5, date: today }, 2, today)).toBe(
      false,
    );
  });

  it('returns false when the progress belongs to another day', () => {
    expect(
      isWirdCompletedToday({ value: 2, date: 'Tue Sep 22 2026' }, 2, today),
    ).toBe(false);
  });

  it('returns false when the configured goal is invalid', () => {
    expect(isWirdCompletedToday({ value: 2, date: today }, 0, today)).toBe(
      false,
    );
  });
});

describe('Wird schedule', () => {
  const now = new Date(2026, 8, 23, 19, 0, 0);

  it('creates stable identifiers from local calendar dates', () => {
    const date = new Date(2026, 8, 23, 20, 0, 0);

    expect(getLocalDateKey(date)).toBe('20260923');
    expect(getWirdNotificationIdentifier('preset-wird', date)).toBe(
      'wird_preset-wird_20260923_2000',
    );
  });

  it('schedules both enabled Wird reminders independently', () => {
    const result = buildWirdSchedule(
      [startReminder, followUpReminder, mulkReminder],
      false,
      now,
      2,
    );

    expect(result.map((entry) => entry.identifier)).toEqual([
      'wird_preset-wird_20260923_2000',
      'wird_preset-wird_20260924_2000',
      'wird_preset-wird-follow-up_20260923_2200',
      'wird_preset-wird-follow-up_20260924_2200',
    ]);
  });

  it('skips all of today after the daily Wird is complete', () => {
    const result = buildWirdSchedule(
      [startReminder, followUpReminder],
      true,
      now,
      2,
    );

    expect(result.map((entry) => entry.dateKey)).toEqual([
      '20260924',
      '20260924',
    ]);
  });

  it('skips an occurrence whose time has already passed today', () => {
    const lateNow = new Date(2026, 8, 23, 21, 0, 0);

    const result = buildWirdSchedule(
      [startReminder, followUpReminder],
      false,
      lateNow,
      1,
    );

    expect(result.map((entry) => entry.identifier)).toEqual([
      'wird_preset-wird-follow-up_20260923_2200',
    ]);
  });

  it('ignores disabled Wird reminders and unrelated presets', () => {
    const disabledStart = {
      ...startReminder,
      enabled: false,
    };

    const result = buildWirdSchedule(
      [disabledStart, followUpReminder, mulkReminder],
      false,
      now,
      1,
    );

    expect(result).toHaveLength(1);
    expect(result[0].reminder.id).toBe('preset-wird-follow-up');
  });

  it('returns no entries for a non-positive scheduling window', () => {
    expect(
      buildWirdSchedule([startReminder, followUpReminder], false, now, 0),
    ).toEqual([]);
  });

  it('changes the identifier when the reminder time changes', () => {
    const atEight = new Date(2026, 8, 23, 20, 0, 0);
    const atEightThirty = new Date(2026, 8, 23, 20, 30, 0);

    expect(getWirdNotificationIdentifier('preset-wird', atEight)).toBe(
      'wird_preset-wird_20260923_2000',
    );

    expect(getWirdNotificationIdentifier('preset-wird', atEightThirty)).toBe(
      'wird_preset-wird_20260923_2030',
    );
  });
});
