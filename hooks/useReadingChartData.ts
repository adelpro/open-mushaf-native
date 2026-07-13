import { useCallback, useMemo, useState } from 'react';

import Constants from 'expo-constants';
import { useAtomValue } from 'jotai/react';

import { CHART_PERIODS } from '@/constants';
import {
  currentSavedPage,
  DailyReadingRecord,
  readingHistory,
  yesterdayPage,
} from '@/jotai/atoms';
import { daysAgo } from '@/utils';
import { getTodayHizbsRead } from '@/utils/dailyTracker';

export type ChartMetric = 'hizbs' | 'pages';
export type GroupBy = 'day' | 'week' | 'month';

// Sum a slice of daily records into a single weekly bucket. The bucket
// inherits its `date` from the last day in the slice (the most recent day
// in the bucket is the most informative label anchor) and computes
// `weekStart` by walking back `chunk.length - 1` days from that anchor —
// using the actual chunk length keeps the range accurate for the partial
// trailing bucket that appears when the period isn't a multiple of 7
// (e.g. 30 days → 4 full weeks + 2 days).
const aggregateWeek = (
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
    // A weekly bucket counts as having a record if at least one underlying
    // day had one. An empty bucket (user didn't track at all that week)
    // stays at 0 with hasRecord=false so the chart can render it as "no
    // data" instead of "read 0".
    hasRecord: daily.some((d) => d.hasRecord),
  };
};

const aggregateByWeek = (
  daily: readonly DailyReadingRecord[],
): DailyReadingRecord[] => {
  const weeks: DailyReadingRecord[] = [];
  for (let i = 0; i < daily.length; i += 7) {
    const chunk = daily.slice(i, i + 7);
    if (chunk.length > 0) weeks.push(aggregateWeek(chunk));
  }
  return weeks;
};

// Sum a slice of daily records into a single 30-day bucket. Same shape as
// `aggregateWeek` — the bucket inherits its `date` from the last day in the
// slice and walks back `chunk.length - 1` days to compute the start. Today
// only the 90-day period exposes `groupBy='month'`, so `chunk.length` is
// always 30, but the helper accepts partial trailing buckets for robustness
// (matches the `aggregateWeek` contract so the same `daysInBucket` field
// drives the partial-bucket visual treatment).
const aggregateMonth = (
  daily: readonly DailyReadingRecord[],
): DailyReadingRecord => {
  const end = new Date(daily[daily.length - 1].date);
  const start = new Date(end);
  start.setDate(end.getDate() - (daily.length - 1));
  return {
    date: end.toDateString(),
    weekStart: start.toDateString(), // bucket start; re-using the field
    daysInBucket: daily.length,
    hizbsCompleted: parseFloat(
      daily.reduce((s, d) => s + d.hizbsCompleted, 0).toFixed(1),
    ),
    pagesRead: daily.reduce((s, d) => s + d.pagesRead, 0),
    // Mirror `aggregateWeek`: a monthly bucket counts as recorded if any
    // day inside it had a record. Keeps the "no data" vs "read 0"
    // distinction intact when the user is partway through a 30-day bucket.
    hasRecord: daily.some((d) => d.hasRecord),
  };
};

const aggregateByMonth = (
  daily: readonly DailyReadingRecord[],
): DailyReadingRecord[] => {
  const months: DailyReadingRecord[] = [];
  for (let i = 0; i < daily.length; i += 30) {
    const chunk = daily.slice(i, i + 30);
    if (chunk.length > 0) months.push(aggregateMonth(chunk));
  }
  return months;
};

// `Constants.executionEnvironment` is `'storeClient'` only when running inside
// Expo Go (the `expo start` dev client). In Expo Go, `react-native-mmkv` v3
// cannot load its native driver, so the persistent atoms stay at their
// initial values and `readingHistory` is always empty. We use that signal to
// fall back to a deterministic mock so the chart is not blank during dev.
// In a native dev/release build, `executionEnvironment` is `'standalone'` or
// `'bare'`, MMKV works, and we always use real data.
const isExpoGo = Constants.executionEnvironment === 'storeClient';

/**
 * Hook to aggregate and calculate user reading metrics for visualization in charts.
 * Processes Jotai store history against the selected tracking metric.
 *
 * @param metric - The unit of measurement for charting data ('hizbs' | 'pages'). Defaults to 'hizbs'.
 * @param groupBy - Granularity for bar rendering. `'day'` (default) shows one bar per day; `'week'` buckets days into 7-day totals.
 * @returns Chart configurations including the data array, total sum, average, max value, period-over-period delta, and period mutators.
 */
export function useReadingChartData(
  metric: ChartMetric = 'hizbs',
  groupBy: GroupBy = 'day',
) {
  const history = useAtomValue(readingHistory);
  const savedPage = useAtomValue(currentSavedPage);
  const yesterday = useAtomValue(yesterdayPage);
  const [periodIndex, setPeriodIndex] = useState(0);
  const period = CHART_PERIODS[periodIndex].days;

  const todayDateStr = new Date().toDateString();
  const todayPagesRead = Math.max(0, (savedPage as number) - yesterday.value);
  // Today's hizbs are derived from the same page delta `todayPagesRead`
  // uses — the `dailyTrackerCompleted.value` atom was never wired up to
  // be incremented, so reading it would always return 0 here.
  const todayHizbsRead = getTodayHizbsRead(
    savedPage as number,
    yesterday.value,
  );

  const data: DailyReadingRecord[] = useMemo(() => {
    // ─── DEV_MOCK: only used in Expo Go or with no real history ───────────────
    // Two paths can land us here:
    //   1. `expo start` (Expo Go) — MMKV cannot load, so `readingHistory` is
    //      always empty and we want a deterministic chart for UI development.
    //   2. Native dev build with no history yet — also convenient for the
    //      developer to see a populated chart while building the UI.
    // The mock must never override real data, so `history.length === 0` is a
    // hard requirement in both cases.
    if ((isExpoGo || __DEV__) && history.length === 0) {
      const seed = (n: number) =>
        Math.abs(Math.sin(n * 9301 + 49297) * 233280) % 1;
      const result: DailyReadingRecord[] = [];
      for (let i = period - 1; i >= 0; i--) {
        const dateStr = daysAgo(i);
        const skip = seed(i) > 0.78; // ~22% of days have no reading
        const hizbs = skip ? 0 : parseFloat((seed(i + 1) * 3 + 0.5).toFixed(1));
        const pages = skip ? 0 : Math.round(seed(i + 2) * 12 + 1);
        // In the dev mock every slot is "recorded" — `skip` toggles the
        // *value* to zero but the slot itself is part of the synthetic
        // dataset, so hasRecord stays true. This keeps the chart visually
        // full during dev (no dashed-outline gaps) while production still
        // gets the no-record treatment for untracked days.
        result.push({
          date: dateStr,
          hizbsCompleted: hizbs,
          pagesRead: pages,
          hasRecord: true,
        });
      }
      return result;
    }
    // ─── END DEV_MOCK ────────────────────────────────────────────────────────

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

    hizbMap.set(todayDateStr, todayHizbsRead);
    pagesMap.set(todayDateStr, todayPagesRead);
    recordedDates.add(todayDateStr);

    // Build daily records for the current period
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
  }, [history, todayDateStr, todayHizbsRead, todayPagesRead, period]);

  // When grouping by week/month, the series collapses to chunked totals.
  const chartData = useMemo(
    () =>
      groupBy === 'week'
        ? aggregateByWeek(data)
        : groupBy === 'month'
          ? aggregateByMonth(data)
          : data,
    [groupBy, data],
  );

  const getValue = useCallback(
    (d: DailyReadingRecord) =>
      metric === 'pages' ? d.pagesRead : d.hizbsCompleted,
    [metric],
  );

  const maxValue = useMemo(
    () => Math.max(1, ...chartData.map(getValue)),
    [chartData, getValue],
  );

  const total = useMemo(
    () => chartData.reduce((sum, d) => sum + getValue(d), 0),
    [chartData, getValue],
  );

  // Average: per-day when grouping is 'day', per-week when 'week'. Using
  // `chartData.length` keeps the denominator correct even when the
  // last bucket is partial (e.g. 90 days / 7 = 12 full weeks + 6 days).
  const unitCount = chartData.length || 1;
  const avg = total / unitCount;

  // For the daily view only, recompute the average excluding buckets with
  // no record so a user who started tracking 22 days ago doesn't see
  // their 1-hizb/day pace reported as 0.24 hizb/day. Weekly/monthly
  // averages already collapse the unrecorded stretch into zero-totals
  // within each bucket, so we keep the simpler `avg` there.
  const recordsWithData = data.filter((d) => d.hasRecord).length;
  const effectiveAvg =
    groupBy === 'day' && recordsWithData > 0 ? total / recordsWithData : avg;

  // `trackingStartedAt` is the earliest recorded date in the current
  // window — `null` when the user has no records at all (the empty state
  // handles that). Rendered as a small caption so users who haven't yet
  // filled the full 90-day window know the chart isn't missing data.
  const trackingStartedAt =
    recordsWithData > 0 ? (data.find((d) => d.hasRecord)?.date ?? null) : null;

  return {
    data: chartData,
    maxValue,
    total,
    avg,
    effectiveAvg,
    recordsWithData,
    trackingStartedAt,
    period,
    periodIndex,
    setPeriodIndex,
    metric,
    getValue,
  };
}
