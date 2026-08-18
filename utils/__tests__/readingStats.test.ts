import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { DailyReadingRecord } from '@/jotai/atoms';
import {
  buildDailyRecords,
  getMetricValue,
  groupDailyRecords,
  summarizeReadingStats,
} from '@/utils/readingStats';

// A fixed "now" so every `daysAgo` call in these tests is deterministic.
// Noon local time keeps the arithmetic clear of DST transitions, which are
// exercised separately in readingChart.test.ts.
const NOW = new Date(2026, 5, 15, 12, 0, 0); // Mon Jun 15 2026

/** The date string `n` days before the frozen "now". */
const day = (n: number) => {
  const d = new Date(NOW);
  d.setDate(d.getDate() - n);
  return d.toDateString();
};

/** A recorded day. Omitted fields default to zero. */
const record = (
  daysBack: number,
  hizbsCompleted = 0,
  pagesRead = 0,
): DailyReadingRecord => ({
  date: day(daysBack),
  hizbsCompleted,
  pagesRead,
});

/** `count` consecutive tracked days, oldest first, all with the same values. */
const trackedRun = (
  count: number,
  hizbsCompleted: number,
  pagesRead: number,
): DailyReadingRecord[] =>
  Array.from({ length: count }, (_, i) => ({
    date: day(count - 1 - i),
    hizbsCompleted,
    pagesRead,
    hasRecord: true,
  }));

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(NOW);
});

afterEach(() => {
  vi.useRealTimers();
});

describe('buildDailyRecords', () => {
  const tracker = { value: 0, date: day(0) };

  it('returns one slot per day, oldest first, ending today', () => {
    const result = buildDailyRecords([], tracker, 0, 7);

    expect(result).toHaveLength(7);
    expect(result[0].date).toBe(day(6));
    expect(result[6].date).toBe(day(0));
    expect(result.map((r) => r.date)).toEqual(
      [6, 5, 4, 3, 2, 1, 0].map((n) => day(n)),
    );
  });

  it('marks untracked days as having no record, not as zero reading', () => {
    const result = buildDailyRecords([record(3, 2, 10)], tracker, 0, 7);

    const tracked = result.find((r) => r.date === day(3));
    const untracked = result.find((r) => r.date === day(4));

    expect(tracked).toMatchObject({
      hasRecord: true,
      hizbsCompleted: 2,
      pagesRead: 10,
    });
    expect(untracked).toMatchObject({
      hasRecord: false,
      hizbsCompleted: 0,
      pagesRead: 0,
    });
  });

  it('keeps a stored zero-page day as a real record', () => {
    // A day the user opened the app but read nothing is meaningfully
    // different from a day before they started tracking: same zero value,
    // but `hasRecord` stays true so it still counts toward the average.
    const result = buildDailyRecords([record(2, 0, 0)], tracker, 0, 7);

    expect(result.find((r) => r.date === day(2))).toMatchObject({
      hasRecord: true,
      hizbsCompleted: 0,
      pagesRead: 0,
    });
  });

  it("takes today's figures from the live tracker, not from history", () => {
    // History can hold a stale entry for today; the tracker is authoritative
    // until the day rolls over and the entry is rewritten.
    const stale = [record(0, 1, 5)];
    const result = buildDailyRecords(stale, { value: 3, date: day(0) }, 12, 7);

    expect(result[6]).toMatchObject({
      date: day(0),
      hizbsCompleted: 3,
      pagesRead: 12,
      hasRecord: true,
    });
  });

  it("records today even when the tracker's value is zero", () => {
    const result = buildDailyRecords([], tracker, 0, 7);

    expect(result[6]).toMatchObject({ date: day(0), hasRecord: true });
  });

  it('ignores history entries that fall outside the window', () => {
    const result = buildDailyRecords([record(40, 5, 20)], tracker, 0, 7);

    expect(result).toHaveLength(7);
    expect(result.filter((r) => r.hasRecord)).toHaveLength(1); // today only
    expect(result.some((r) => r.hizbsCompleted === 5)).toBe(false);
  });

  it('defaults a legacy record with no pagesRead to zero pages', () => {
    // `pagesRead` was added after `hizbsCompleted`; records persisted by an
    // older build can be missing it.
    const legacy = { date: day(2), hizbsCompleted: 1.5 } as DailyReadingRecord;
    const result = buildDailyRecords([legacy], tracker, 0, 7);

    expect(result.find((r) => r.date === day(2))).toMatchObject({
      hasRecord: true,
      hizbsCompleted: 1.5,
      pagesRead: 0,
    });
  });

  it('rolls the window forward when the day changes', () => {
    const history = [record(0, 2, 8)];
    const before = buildDailyRecords(history, { value: 2, date: day(0) }, 8, 7);

    // Midnight passes: yesterday's tracker value has been written to history
    // and today starts fresh at zero.
    vi.setSystemTime(new Date(2026, 5, 16, 9, 0, 0));
    const todayStr = new Date(2026, 5, 16).toDateString();
    const after = buildDailyRecords(
      history,
      { value: 0, date: todayStr },
      0,
      7,
    );

    expect(before[6].date).toBe(day(0));
    expect(after[6].date).toBe(todayStr);
    // The day that was "today" is now the second-to-last slot and keeps the
    // figures that were rolled into history.
    expect(after[5]).toMatchObject({
      date: day(0),
      hizbsCompleted: 2,
      pagesRead: 8,
      hasRecord: true,
    });
    expect(after[6]).toMatchObject({ hizbsCompleted: 0, pagesRead: 0 });
    // The oldest day in the window has dropped off.
    expect(after.some((r) => r.date === before[0].date)).toBe(false);
  });

  it('spans a month boundary without gaps', () => {
    vi.setSystemTime(new Date(2026, 6, 2, 12, 0, 0)); // Thu Jul 02 2026
    const result = buildDailyRecords(
      [],
      { value: 0, date: new Date(2026, 6, 2).toDateString() },
      0,
      5,
    );

    expect(result.map((r) => r.date)).toEqual([
      new Date(2026, 5, 28).toDateString(),
      new Date(2026, 5, 29).toDateString(),
      new Date(2026, 5, 30).toDateString(),
      new Date(2026, 6, 1).toDateString(),
      new Date(2026, 6, 2).toDateString(),
    ]);
  });
});

describe('groupDailyRecords', () => {
  it('passes the daily series through unchanged', () => {
    const daily = trackedRun(30, 1, 4);

    expect(groupDailyRecords(daily, 'day')).toEqual(daily);
  });

  it('sums whole weeks when the period divides evenly', () => {
    const weeks = groupDailyRecords(trackedRun(28, 1, 4), 'week');

    expect(weeks).toHaveLength(4);
    expect(weeks[0]).toMatchObject({
      hizbsCompleted: 7,
      pagesRead: 28,
      daysInBucket: 7,
      hasRecord: true,
    });
    // The bucket is anchored on its last day and spans back to its first.
    expect(weeks[0].date).toBe(day(21));
    expect(weeks[0].weekStart).toBe(day(27));
    expect(weeks[3].date).toBe(day(0));
    expect(weeks[3].weekStart).toBe(day(6));
  });

  it('leaves the trailing bucket short when the period is incomplete', () => {
    // 30 days grouped by week is 4 full weeks plus a 2-day remainder.
    const weeks = groupDailyRecords(trackedRun(30, 1, 4), 'week');

    expect(weeks).toHaveLength(5);
    expect(weeks.slice(0, 4).map((w) => w.daysInBucket)).toEqual([7, 7, 7, 7]);
    expect(weeks[4]).toMatchObject({
      daysInBucket: 2,
      hizbsCompleted: 2,
      pagesRead: 8,
    });
    expect(weeks[4].date).toBe(day(0));
    expect(weeks[4].weekStart).toBe(day(1));
  });

  it('sums whole months across the 90-day window', () => {
    const months = groupDailyRecords(trackedRun(90, 0.5, 3), 'month');

    expect(months).toHaveLength(3);
    expect(months.map((m) => m.daysInBucket)).toEqual([30, 30, 30]);
    expect(months[2]).toMatchObject({ hizbsCompleted: 15, pagesRead: 90 });
    expect(months[2].date).toBe(day(0));
    expect(months[2].weekStart).toBe(day(29));
  });

  it('leaves a short trailing month bucket for a partial window', () => {
    const months = groupDailyRecords(trackedRun(70, 1, 2), 'month');

    expect(months.map((m) => m.daysInBucket)).toEqual([30, 30, 10]);
    expect(months[2]).toMatchObject({ hizbsCompleted: 10, pagesRead: 20 });
  });

  it('marks a bucket as recorded when any single day inside it is', () => {
    const daily = trackedRun(7, 0, 0).map((d, i) =>
      i === 3 ? d : { ...d, hasRecord: false },
    );

    expect(groupDailyRecords(daily, 'week')[0].hasRecord).toBe(true);
  });

  it('marks a bucket with no tracked days as having no record', () => {
    const daily = trackedRun(7, 0, 0).map((d) => ({ ...d, hasRecord: false }));

    expect(groupDailyRecords(daily, 'week')[0]).toMatchObject({
      hasRecord: false,
      hizbsCompleted: 0,
      pagesRead: 0,
    });
  });

  it('rounds summed hizbs to one decimal', () => {
    // 0.1 * 7 is 0.7000000000000001 in binary floating point; the chart
    // renders the raw value, so the sum is rounded at aggregation time.
    const weeks = groupDailyRecords(trackedRun(7, 0.1, 0), 'week');

    expect(weeks[0].hizbsCompleted).toBe(0.7);
  });

  it('returns no buckets for an empty series', () => {
    expect(groupDailyRecords([], 'week')).toEqual([]);
    expect(groupDailyRecords([], 'month')).toEqual([]);
  });
});

describe('getMetricValue', () => {
  const rec: DailyReadingRecord = {
    date: day(0),
    hizbsCompleted: 2.5,
    pagesRead: 11,
  };

  it('reads hizbs by default and pages when asked', () => {
    expect(getMetricValue(rec, 'hizbs')).toBe(2.5);
    expect(getMetricValue(rec, 'pages')).toBe(11);
  });
});

describe('summarizeReadingStats', () => {
  /** A window of `period` days where only the newest `tracked` are recorded. */
  const partialWindow = (period: number, tracked: number) =>
    buildDailyRecords(
      Array.from({ length: tracked - 1 }, (_, i) => record(i + 1, 1, 4)),
      { value: 1, date: day(0) },
      4,
      period,
    );

  it('totals and averages the daily series over the whole window', () => {
    const daily = partialWindow(10, 10);
    const stats = summarizeReadingStats(daily, daily, 'hizbs', 'day');

    expect(stats.total).toBe(10);
    expect(stats.avg).toBe(1);
    expect(stats.effectiveAvg).toBe(1);
    expect(stats.recordsWithData).toBe(10);
    expect(stats.maxValue).toBe(1);
  });

  it('averages the daily view over recorded days only', () => {
    // 22 tracked days inside a 90-day window: the honest pace is 1/day, not
    // 22/90 = 0.24/day.
    const daily = partialWindow(90, 22);
    const stats = summarizeReadingStats(daily, daily, 'hizbs', 'day');

    expect(stats.recordsWithData).toBe(22);
    expect(stats.total).toBe(22);
    expect(stats.avg).toBeCloseTo(22 / 90, 10);
    expect(stats.effectiveAvg).toBe(1);
  });

  it('averages weekly and monthly views per bucket', () => {
    const daily = partialWindow(28, 28);

    const weekly = groupDailyRecords(daily, 'week');
    const weekStats = summarizeReadingStats(daily, weekly, 'hizbs', 'week');
    expect(weekStats.total).toBe(28);
    expect(weekStats.avg).toBe(7);
    // Weekly buckets already fold untracked days into their own totals, so
    // there is no separate recorded-day correction.
    expect(weekStats.effectiveAvg).toBe(weekStats.avg);

    const monthly = groupDailyRecords(daily, 'month');
    const monthStats = summarizeReadingStats(daily, monthly, 'hizbs', 'month');
    expect(monthStats.avg).toBe(28);
    expect(monthStats.effectiveAvg).toBe(monthStats.avg);
  });

  it('divides by the real bucket count when the last bucket is partial', () => {
    const daily = partialWindow(30, 30);
    const weekly = groupDailyRecords(daily, 'week');
    const stats = summarizeReadingStats(daily, weekly, 'hizbs', 'week');

    expect(weekly).toHaveLength(5);
    expect(stats.total).toBe(30);
    expect(stats.avg).toBe(6); // 30 / 5 buckets, not 30 / 4 full weeks
  });

  it('counts recorded days from the daily series even when grouped', () => {
    const daily = partialWindow(90, 22);
    const monthly = groupDailyRecords(daily, 'month');
    const stats = summarizeReadingStats(daily, monthly, 'hizbs', 'month');

    expect(monthly).toHaveLength(3);
    expect(stats.recordsWithData).toBe(22);
  });

  it('switches totals with the metric', () => {
    const daily = partialWindow(10, 10);

    expect(summarizeReadingStats(daily, daily, 'pages', 'day').total).toBe(40);
    expect(summarizeReadingStats(daily, daily, 'hizbs', 'day').total).toBe(10);
  });

  it('floors maxValue at 1 so an all-zero window still has a scale', () => {
    const daily = buildDailyRecords([], { value: 0, date: day(0) }, 0, 7);
    const stats = summarizeReadingStats(daily, daily, 'hizbs', 'day');

    expect(stats.total).toBe(0);
    expect(stats.maxValue).toBe(1);
    // Today is always a record, so the recorded-day average is 0/1.
    expect(stats.effectiveAvg).toBe(0);
  });

  it('reports the earliest recorded day as the tracking start', () => {
    const daily = partialWindow(90, 22);
    const stats = summarizeReadingStats(daily, daily, 'hizbs', 'day');

    expect(stats.trackingStartedAt).toBe(day(21));
  });

  it('reports no tracking start when nothing in the window is recorded', () => {
    const daily = Array.from({ length: 7 }, (_, i) => ({
      ...record(6 - i),
      hasRecord: false,
    }));
    const stats = summarizeReadingStats(daily, daily, 'hizbs', 'day');

    expect(stats.trackingStartedAt).toBeNull();
    expect(stats.recordsWithData).toBe(0);
    // With no recorded days there is nothing to correct the average against.
    expect(stats.effectiveAvg).toBe(stats.avg);
  });

  it('handles an empty series without dividing by zero', () => {
    const stats = summarizeReadingStats([], [], 'hizbs', 'day');

    expect(stats.total).toBe(0);
    expect(stats.avg).toBe(0);
    expect(stats.effectiveAvg).toBe(0);
    expect(stats.maxValue).toBe(1);
    expect(stats.trackingStartedAt).toBeNull();
  });
});
