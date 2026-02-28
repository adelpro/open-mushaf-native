import { useMemo, useState } from 'react';

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

export function useReadingChartData(metric: ChartMetric = 'hizbs') {
  const history = useAtomValue(readingHistory);
  const todayTracker = useAtomValue(dailyTrackerCompleted);
  const savedPage = useAtomValue(currentSavedPage);
  const yesterday = useAtomValue(yesterdayPage);
  const [periodIndex, setPeriodIndex] = useState(0);
  const period = CHART_PERIODS[periodIndex].days;

  const todayPagesRead = Math.max(0, (savedPage as number) - yesterday.value);

  const data: DailyReadingRecord[] = useMemo(() => {
    const hizbMap = new Map<string, number>();
    const pagesMap = new Map<string, number>();

    for (const entry of history) {
      hizbMap.set(entry.date, entry.hizbsCompleted);
      pagesMap.set(entry.date, entry.pagesRead ?? 0);
    }

    hizbMap.set(todayTracker.date, todayTracker.value);
    pagesMap.set(todayTracker.date, todayPagesRead);

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

  const getValue = (d: DailyReadingRecord) =>
    metric === 'pages' ? d.pagesRead : d.hizbsCompleted;

  const maxValue = useMemo(
    () => Math.max(1, ...data.map(getValue)),
    [data, metric],
  );

  const total = useMemo(
    () => data.reduce((sum, d) => sum + getValue(d), 0),
    [data, metric],
  );

  const dailyAvg = period > 0 ? total / period : 0;

  return {
    data,
    maxValue,
    total,
    dailyAvg,
    period,
    periodIndex,
    setPeriodIndex,
    metric,
    getValue,
  };
}
