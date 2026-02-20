import { useCallback, useEffect } from 'react';
import { Platform } from 'react-native';

import * as Notifications from 'expo-notifications';
import { useAtom } from 'jotai/react';

import { wirdReminderEnabled, wirdReminderTime } from '@/jotai/atoms';

const NOTIFICATION_ID = 'wird-daily-reminder';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

async function requestPermissions(): Promise<boolean> {
  if (Platform.OS === 'web') return false;

  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;

  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export default function useWirdNotification() {
  const [enabled, setEnabled] = useAtom(wirdReminderEnabled);
  const [time, setTime] = useAtom(wirdReminderTime);

  const scheduleNotification = useCallback(async () => {
    if (Platform.OS === 'web') return;

    await Notifications.cancelScheduledNotificationAsync(NOTIFICATION_ID);

    const hasPermission = await requestPermissions();
    if (!hasPermission) {
      setEnabled(false);
      return;
    }

    await Notifications.scheduleNotificationAsync({
      identifier: NOTIFICATION_ID,
      content: {
        title: 'تذكير الورد اليومي',
        body: 'حان وقت قراءة وردك اليومي من القرآن الكريم',
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: time.hour,
        minute: time.minute,
      },
    });
  }, [time.hour, time.minute, setEnabled]);

  const cancelNotification = useCallback(async () => {
    if (Platform.OS === 'web') return;
    await Notifications.cancelScheduledNotificationAsync(NOTIFICATION_ID);
  }, []);

  useEffect(() => {
    if (enabled) {
      scheduleNotification();
    } else {
      cancelNotification();
    }
  }, [enabled, scheduleNotification, cancelNotification]);

  return { enabled, setEnabled, time, setTime };
}
