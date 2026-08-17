/**
 * Daily-wird completion ratio (0–1) for the TopMenu progress ring.
 *
 * Used by `components/TopMenu/Actions.tsx`.
 */
import { useAtomValue } from 'jotai/react';

import { dailyTrackerCompleted, dailyTrackerGoal } from '@/jotai/atoms';

export function useDailyProgress(): number {
  const goal = useAtomValue(dailyTrackerGoal);
  const completed = useAtomValue(dailyTrackerCompleted);
  if (goal <= 0) {
    return 0;
  }
  return Math.min(1, completed.value / 8 / (goal / 8));
}
