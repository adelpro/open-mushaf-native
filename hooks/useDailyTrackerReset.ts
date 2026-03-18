import { useCallback, useEffect, useRef } from 'react';

import { useAtom, useAtomValue } from 'jotai/react';

import { CHART_PERIODS } from '@/constants';
import {
  currentSavedPage,
  DailyReadingRecord,
  dailyTrackerCompleted,
  readingHistory,
  yesterdayPage,
} from '@/jotai/atoms';

export function useDailyTrackerReset() {
  const [dailyTracker, setDailyTracker] = useAtom(dailyTrackerCompleted);
  const [yesterday, setYesterday] = useAtom(yesterdayPage);
  const [history, setHistory] = useAtom(readingHistory);
  const currentPage = useAtomValue(currentSavedPage);

  const hasRunRef = useRef(false);

  const handleReset = useCallback(() => {
    if (hasRunRef.current) return;
    hasRunRef.current = true;

    const tracker = dailyTracker;
    const yesterdayPageValue = yesterday;
    const historyData = history;
    const savedPage = currentPage as number;

    const today = new Date().toDateString();

    if (tracker.date !== today) {
      const pagesRead = Math.max(0, savedPage - yesterdayPageValue.value);

      if (tracker.value > 0 || pagesRead > 0) {
        const entry: DailyReadingRecord = {
          hizbsCompleted: tracker.value,
          pagesRead,
          date: tracker.date,
        };

        const existingIndex = historyData.findIndex(
          (record) => record.date === tracker.date,
        );

        let updatedHistory: DailyReadingRecord[];

        if (existingIndex !== -1) {
          updatedHistory = [
            ...historyData.slice(0, existingIndex),
            {
              ...entry,
              hizbsCompleted: Math.max(
                entry.hizbsCompleted,
                historyData[existingIndex].hizbsCompleted,
              ),
              pagesRead: Math.max(
                entry.pagesRead,
                historyData[existingIndex].pagesRead,
              ),
            },
            ...historyData.slice(existingIndex + 1),
          ];
        } else {
          updatedHistory = [...historyData, entry];
        }

        const maxDays = CHART_PERIODS[CHART_PERIODS.length - 1].days;
        setHistory(updatedHistory.slice(-maxDays));
      }

      setYesterday({
        value: savedPage,
        date: today,
      });

      setDailyTracker({
        value: 0,
        date: today,
      });
    } else if (yesterdayPageValue.date !== today) {
      setYesterday({
        value: savedPage,
        date: today,
      });
    }
  }, [
    dailyTracker,
    yesterday,
    history,
    currentPage,
    setDailyTracker,
    setHistory,
    setYesterday,
  ]);

  useEffect(() => {
    handleReset();
  }, [handleReset]);
}
