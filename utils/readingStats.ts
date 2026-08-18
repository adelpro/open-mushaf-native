import type { DailyReadingRecord } from '@/jotai/atoms';

import { type ChartMetric, daysAgo, type GroupBy } from './readingChart';

// Number of daily records collapsed into one bucket per granularity. A month
// is a fixed 30-day window rather than a calendar month so every bucket in the
// series covers the same span and stays comparable.
const WEEK_BUCKET_DAYS = 7;
const MONTH_BUCKET_DAYS = 30;

/** Today's in-progress tracker, before it is rolled into `readingHistory`. */
export interface DailyTrackerSnapshot {
  value: number;
  date: string;
}

/** The aggregate figures the chart header renders above the bars. */
export interface ReadingStats {
  total: number;
  maxValue: number;
  avg: number;
  effectiveAvg: number;
  recordsWithData: number;
  trackingStartedAt: string | null;
}

/**
 * Builds one record per day for the trailing `period` days, oldest first and
 * ending with today.
 *
 * Days the user has no entry for are padded with zeros and `hasRecord: false`
 * so the chart can draw them as "not tracked yet" rather than "read nothing".
 * A stored entry of zero is different: it keeps `hasRecord: true` and counts
 * towards the recorded-day average.
 *
 * Today is always taken from the live tracker rather than history — the
 * history entry for today is only written when the day rolls over.
 *
 * @param history - Persisted daily records, in any order.
 * @param todayTracker - Today's in-progress hizb count and its date stamp.
 * @param todayPagesRead - Pages read today, derived from the saved page.
 * @param period - Length of the window in days.
 * @returns `period` records ordered oldest to newest.
 */
export function buildDailyRecords(
  history: readonly DailyReadingRecord[],
  todayTracker: DailyTrackerSnapshot,
  todayPagesRead: number,
  period: number,
): DailyReadingRecord[] {
  const hizbMap = new Map<string, number>();
  const pagesMap = new Map<string, number>();
  // Track which date strings had a real record. Used both to set
  // `hasRecord` on each daily slot (so the chart can render "no data"
  // vs "read 0") and to derive `trackingStartedAt` (the earliest date
  // with a record in the current window).
  const recordedDates = new Set<string>();

  for (const entry of history) {
    hizbMap.set(entry.date, entry.hizbsCompleted);
    pagesMap.set(entry.date, entry.pagesRead ?? 0);
    recordedDates.add(entry.date);
  }

  hizbMap.set(todayTracker.date, todayTracker.value);
  pagesMap.set(todayTracker.date, todayPagesRead);
  recordedDates.add(todayTracker.date);

  const result: DailyReadingRecord[] = [];
  for (let i = period - 1; i >= 0; i--) {
    const dateStr = daysAgo(i);
    const hasRecord = recordedDates.has(dateStr);
    result.push({
      date: dateStr,
      hizbsCompleted: hasRecord ? (hizbMap.get(dateStr) ?? 0) : 0,
      pagesRead: hasRecord ? (pagesMap.get(dateStr) ?? 0) : 0,
      hasRecord,
    });
  }
  return result;
}

// Sum a slice of daily records into a single bucket. The bucket inherits its
// `date` from the last day in the slice (the most recent day in the bucket is
// the most informative label anchor) and computes `weekStart` by walking back
// `chunk.length - 1` days from that anchor — using the actual chunk length
// keeps the range accurate for the partial trailing bucket that appears when
// the period isn't a multiple of the bucket size (e.g. 30 days grouped by
// week → 4 full weeks + 2 days).
const aggregateBucket = (
  daily: readonly DailyReadingRecord[],
): DailyReadingRecord => {
  const end = new Date(daily[daily.length - 1].date);
  const start = new Date(end);
  start.setDate(end.getDate() - (daily.length - 1));
  return {
    date: end.toDateString(),
    weekStart: start.toDateString(),
    daysInBucket: daily.length,
    hizbsCompleted: parseFloat(
      daily.reduce((s, d) => s + d.hizbsCompleted, 0).toFixed(1),
    ),
    pagesRead: daily.reduce((s, d) => s + d.pagesRead, 0),
    // A bucket counts as having a record if at least one underlying day had
    // one. An empty bucket (user didn't track at all that week) stays at 0
    // with hasRecord=false so the chart can render it as "no data" instead
    // of "read 0".
    hasRecord: daily.some((d) => d.hasRecord),
  };
};

/**
 * Collapses the daily series into the bars the chart actually renders.
 *
 * Buckets are cut from the oldest day forward, so an incomplete period leaves
 * the *trailing* bucket short; its `daysInBucket` is the real day count and
 * drives the partial-bucket treatment in `formatLabel` and the chart.
 *
 * @param daily - Daily records, oldest first.
 * @param groupBy - Bar granularity. `'day'` passes the series through.
 * @returns One record per rendered bar, oldest first.
 */
export function groupDailyRecords(
  daily: readonly DailyReadingRecord[],
  groupBy: GroupBy,
): DailyReadingRecord[] {
  if (groupBy === 'day') return [...daily];

  const size = groupBy === 'week' ? WEEK_BUCKET_DAYS : MONTH_BUCKET_DAYS;
  const buckets: DailyReadingRecord[] = [];
  for (let i = 0; i < daily.length; i += size) {
    const chunk = daily.slice(i, i + size);
    if (chunk.length > 0) buckets.push(aggregateBucket(chunk));
  }
  return buckets;
}

/**
 * Reads the charted quantity off a record for the selected metric.
 *
 * @param record - A daily record or an aggregated bucket.
 * @param metric - The unit the chart is currently displaying.
 * @returns Hizbs or pages, depending on `metric`.
 */
export function getMetricValue(
  record: DailyReadingRecord,
  metric: ChartMetric,
): number {
  return metric === 'pages' ? record.pagesRead : record.hizbsCompleted;
}

/**
 * Derives the header figures for the current window.
 *
 * `avg` is per rendered bar — per day, per week, or per month — and uses
 * `grouped.length` as the denominator so a partial trailing bucket doesn't
 * skew it. `effectiveAvg` differs only in the daily view, where it divides by
 * the number of *recorded* days: a user who started tracking 22 days ago
 * should see their 1-hizb/day pace, not 0.24 hizb/day across a 90-day window.
 * Weekly and monthly buckets already collapse untracked stretches into their
 * own totals, so `effectiveAvg` falls back to `avg` there.
 *
 * @param daily - The ungrouped daily series; carries the `hasRecord` flags.
 * @param grouped - The rendered bars, from `groupDailyRecords`.
 * @param metric - The unit the chart is currently displaying.
 * @param groupBy - Bar granularity.
 * @returns Totals, averages, recorded-day count, and the tracking start date.
 */
export function summarizeReadingStats(
  daily: readonly DailyReadingRecord[],
  grouped: readonly DailyReadingRecord[],
  metric: ChartMetric,
  groupBy: GroupBy,
): ReadingStats {
  const values = grouped.map((d) => getMetricValue(d, metric));
  // Floor of 1 keeps the y-axis and the bar heights finite on an all-zero
  // window (nothing to divide by otherwise).
  const maxValue = Math.max(1, ...values);
  const total = values.reduce((sum, v) => sum + v, 0);
  const avg = total / (grouped.length || 1);

  const recordsWithData = daily.filter((d) => d.hasRecord).length;
  const effectiveAvg =
    groupBy === 'day' && recordsWithData > 0 ? total / recordsWithData : avg;

  // The earliest recorded date in the current window — `null` when the user
  // has no records at all (the empty state handles that). Rendered as a small
  // caption so users who haven't yet filled the full 90-day window know the
  // chart isn't missing data.
  const trackingStartedAt =
    recordsWithData > 0 ? (daily.find((d) => d.hasRecord)?.date ?? null) : null;

  return {
    total,
    maxValue,
    avg,
    effectiveAvg,
    recordsWithData,
    trackingStartedAt,
  };
}
