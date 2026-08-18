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
import {
  buildDailyRecords,
  type ChartMetric,
  daysAgo,
  getMetricValue,
  type GroupBy,
  groupDailyRecords,
  summarizeReadingStats,
} from '@/utils';

// Re-exported so consumers keep importing these from `@/hooks` — the chart
// component and its props are typed against them.
export type { ChartMetric, GroupBy };

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
 * The calculations themselves live in `@/utils/readingStats` as pure
 * functions; this hook only wires the atoms and the period state to them.
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

    return buildDailyRecords(history, todayTracker, todayPagesRead, period);
  }, [history, todayTracker, todayPagesRead, period]);

  // When grouping by week/month, the series collapses to chunked totals.
  const chartData = useMemo(
    () => groupDailyRecords(data, groupBy),
    [groupBy, data],
  );

  const getValue = useCallback(
    (d: DailyReadingRecord) => getMetricValue(d, metric),
    [metric],
  );

  const {
    total,
    maxValue,
    avg,
    effectiveAvg,
    recordsWithData,
    trackingStartedAt,
  } = useMemo(
    () => summarizeReadingStats(data, chartData, metric, groupBy),
    [data, chartData, metric, groupBy],
  );

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
