import { useEffect, useState } from 'react';
import { AppState, Platform } from 'react-native';

import { useAtom, useAtomValue } from 'jotai/react';

import {
  dailyTrackerCompleted,
  dailyTrackerGoal,
  remindersAtom,
  WIRD_FOLLOW_UP_REMINDER,
} from '@/jotai/atoms';
import { syncWirdReminders } from '@/utils/notifications';
import {
  ensureWirdFollowUpReminder,
  isWirdCompletedToday,
} from '@/utils/wirdReminders';

/**
 * Keeps daily Wird reminder settings synchronized with scheduled notifications.
 *
 * The hook also migrates persisted reminder state created before the follow-up
 * Wird reminder existed. When today's goal is completed, reconciliation removes
 * the remaining notifications for today while leaving future days scheduled.
 */
export function useWirdReminderSync() {
  const [reminders, setReminders] = useAtom(remindersAtom);
  const dailyProgress = useAtomValue(dailyTrackerCompleted);
  const dailyGoal = useAtomValue(dailyTrackerGoal);
  const [syncRevision, setSyncRevision] = useState(0);

  const completedToday = isWirdCompletedToday(dailyProgress, dailyGoal);

  // Refresh the rolling notification window whenever the app becomes active.
  useEffect(() => {
    if (Platform.OS === 'web') return;

    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        setSyncRevision((revision) => revision + 1);
      }
    });

    return () => subscription.remove();
  }, []);

  useEffect(() => {
    const normalizedReminders = ensureWirdFollowUpReminder(
      reminders,
      WIRD_FOLLOW_UP_REMINDER,
    );

    if (normalizedReminders !== reminders) {
      setReminders(normalizedReminders);
      return;
    }

    if (Platform.OS === 'web') return;

    let disposed = false;

    const sync = async () => {
      try {
        const syncedReminders = await syncWirdReminders(
          reminders,
          completedToday,
        );

        if (!disposed && syncedReminders !== reminders) {
          setReminders(syncedReminders);
        }
      } catch (error) {
        console.error('Failed to sync Wird reminders:', error);
      }
    };

    void sync();

    return () => {
      disposed = true;
    };
  }, [completedToday, reminders, setReminders, syncRevision]);
}
