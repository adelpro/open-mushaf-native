import { useMemo, useState } from 'react';

import { useAtomValue } from 'jotai/react';

import { CHART_PERIODS } from '@/constants';
import {
  DailyReadingRecord,
  dailyTrackerCompleted,
  readingHistory,
} from '@/jotai/atoms';
import { daysAgo } from '@/utils';

export function useReadingChartData() {
  const history = useAtomValue(readingHistory);
  const todayData = useAtomValue(dailyTrackerCompleted);
  const [periodIndex, setPeriodIndex] = useState(0);
  const period = CHART_PERIODS[periodIndex].days;

  const data: DailyReadingRecord[] = useMemo(() => {
    const map = new Map<string, number>();
    for (const entry of history) {
      map.set(entry.date, entry.hizbsCompleted);
    }
    map.set(todayData.date, todayData.value);

    const result: DailyReadingRecord[] = [];
    for (let i = period - 1; i >= 0; i--) {
      const dateStr = daysAgo(i);
      result.push({
        date: dateStr,
        hizbsCompleted: map.get(dateStr) ?? 0,
      });
    }
    return result;
  }, [history, todayData, period]);

  const maxValue = useMemo(
    () => Math.max(1, ...data.map((d) => d.hizbsCompleted)),
    [data],
  );

  const totalHizbs = useMemo(
    () => data.reduce((sum, d) => sum + d.hizbsCompleted, 0),
    [data],
  );

  const dailyAvg = period > 0 ? totalHizbs / period : 0;

  return {
    data,
    maxValue,
    totalHizbs,
    dailyAvg,
    period,
    periodIndex,
    setPeriodIndex,
  };
}
