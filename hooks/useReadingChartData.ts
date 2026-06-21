import { useCallback, useMemo, useState } from 'react';

import Constants from 'expo-constants';
import { useAtomValue } from 'jotai/react';

import { CHART_PERIODS } from '@/constants';
import {
  currentSavedPage,
  DailyReadingRecord,
  dailyTrackerCompleted,
  readingHistory,
  yesterdayPage,
} from '@/jotai/atoms';
import { daysAgo } from '@/utils';

export type ChartMetric = 'hizbs' | 'pages';
export type GroupBy = 'day' | 'week';

// Sum a slice of daily records into a single 7-day bucket. The bucket
// inherits its date from the last day in the slice (the most recent day
// in the bucket is the most informative label anchor).
const aggregateWeek = (
  daily: readonly DailyReadingRecord[],
): DailyReadingRecord => ({
  date: daily[daily.length - 1].date,
  hizbsCompleted: parseFloat(
    daily.reduce((s, d) => s + d.hizbsCompleted, 0).toFixed(1),
  ),
  pagesRead: daily.reduce((s, d) => s + d.pagesRead, 0),
});

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
  const todayTracker = useAtomValue(dailyTrackerCompleted);
  const savedPage = useAtomValue(currentSavedPage);
  const yesterday = useAtomValue(yesterdayPage);
  const [periodIndex, setPeriodIndex] = useState(0);
  const period = CHART_PERIODS[periodIndex].days;

  const todayPagesRead = Math.max(0, (savedPage as number) - yesterday.value);

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
        result.push({ date: dateStr, hizbsCompleted: hizbs, pagesRead: pages });
      }
      return result;
    }
    // ─── END DEV_MOCK ────────────────────────────────────────────────────────

    const hizbMap = new Map<string, number>();
    const pagesMap = new Map<string, number>();

    for (const entry of history) {
      hizbMap.set(entry.date, entry.hizbsCompleted);
      pagesMap.set(entry.date, entry.pagesRead ?? 0);
    }

    hizbMap.set(todayTracker.date, todayTracker.value);
    pagesMap.set(todayTracker.date, todayPagesRead);

    // Build daily records for the current period
    const result: DailyReadingRecord[] = [];
    for (let i = period - 1; i >= 0; i--) {
      const dateStr = daysAgo(i);
      result.push({
        date: dateStr,
        hizbsCompleted: hizbMap.get(dateStr) ?? 0,
        pagesRead: pagesMap.get(dateStr) ?? 0,
      });
    }
    return result;
  }, [history, todayTracker, todayPagesRead, period]);

  // When grouping by week, the series collapses to weekly totals.
  const chartData = useMemo(
    () => (groupBy === 'week' ? aggregateByWeek(data) : data),
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

  return {
    data: chartData,
    maxValue,
    total,
    avg,
    period,
    periodIndex,
    setPeriodIndex,
    metric,
    getValue,
  };
}
