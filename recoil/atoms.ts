import ReactNativeRecoilPersist from 'react-native-recoil-persist';
import { atom, AtomEffect } from 'recoil';

import { TafseerTabs } from '@/types';
import { Riwaya } from '@/types/riwaya';

export const bottomMenuState = atom<boolean>({
  key: 'BottomMenuState',
  default: true,
  effects: [ReactNativeRecoilPersist.persistAtom],
});

export const advancedSearch = atom<boolean>({
  key: 'AdvancedSearch',
  default: false,
  effects: [ReactNativeRecoilPersist.persistAtom],
});

export const currentSavedPage = atom<number>({
  key: 'CurrentSavedPage',
  default: 1,
  effects: [ReactNativeRecoilPersist.persistAtom],
});

export const finishedTutorial = atom<boolean>({
  key: 'FinishedTutorial',
  default: undefined,
  effects: [ReactNativeRecoilPersist.persistAtom],
});

export const mushafRiwaya = atom<Riwaya>({
  key: 'MushafRiwaya',
  default: undefined,
  effects: [ReactNativeRecoilPersist.persistAtom],
});

export const tafseerTab = atom<TafseerTabs>({
  key: 'TafseerTab',
  default: 'katheer',
  effects: [ReactNativeRecoilPersist.persistAtom],
});

export const flipSound = atom<boolean>({
  key: 'FlipSound',
  default: false,
  effects: [ReactNativeRecoilPersist.persistAtom],
});

export const currentAppVersion = atom<string | undefined>({
  key: 'CurrentAppVersion',
  default: undefined,
  effects: [ReactNativeRecoilPersist.persistAtom],
});

export const mushafContrast = atom<number>({
  key: 'MushafContrast',
  default: 0.5,
  effects: [ReactNativeRecoilPersist.persistAtom],
});

/**
 * 0 - disabled
 * 1 - hizb
 * 2 - juz
 */
export const hizbNotification = atom<number>({
  key: 'HizbNotification',
  default: 0,
  effects: [ReactNativeRecoilPersist.persistAtom],
});

// Tracking system atoms for Hizb-based reading goals
export const dailyHizbGoal = atom<number>({
  key: 'DailyHizbGoal',
  default: 1,
  effects: [ReactNativeRecoilPersist.persistAtom],
});
// Store the last date the app was used
export const lastUsedDate = atom<string>({
  key: 'LastUsedDate',
  default: new Date().toDateString(),
  effects: [ReactNativeRecoilPersist.persistAtom],
});

// Type for the daily hizb tracking
type DailyHizbProgress = {
  value: number;
  date: string;
};

export const dailyHizbCompleted = atom<DailyHizbProgress>({
  key: 'DailyHizbCompleted',
  default: {
    value: 0,
    date: new Date().toDateString(),
  },
  effects: [
    ReactNativeRecoilPersist.persistAtom,
    ({ setSelf, onSet }) => {
      // Check date on initialization
      const today = new Date().toDateString();
      onSet((newValue) => {
        // If it's a new day but the date hasn't been updated yet
        if (newValue.date !== today) {
          setSelf({
            value: 0,
            date: today,
          });
        }
      });
    },
  ],
});

// Type for tracking the page with date
type PageWithDate = {
  value: number;
  date: string;
};

// Replace the simple yesterdayPage atom with a more sophisticated version
export const yesterdayPage = atom<PageWithDate>({
  key: 'yesterdayPage',
  default: {
    value: 1,
    date: new Date().toDateString(),
  },
  effects: [
    ReactNativeRecoilPersist.persistAtom,
    ({ setSelf, getPromise }) => {
      const checkDate = async () => {
        const today = new Date();
        const savedPage = await getPromise(currentSavedPage);

        // Get the stored date from yesterdayPage
        const storedValue = await getPromise(yesterdayPage);
        const storedDate = new Date(storedValue.date);

        // Calculate the difference in days
        const diffTime = Math.abs(today.getTime() - storedDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        // If there's a two-day or more difference, update yesterdayPage to currentSavedPage
        if (diffDays >= 2) {
          setSelf({
            value: savedPage,
            date: today.toDateString(),
          });
        }
      };

      // Check when the effect is first applied (app starts)
      checkDate();
    },
  ],
});

// Create a timer effect for TopMenu State
const timerEffect: (duration_ms: number) => AtomEffect<any> =
  (duration_ms: number) =>
  ({ setSelf, onSet }) => {
    let timerId: NodeJS.Timeout;
    const setTimer = () => {
      timerId = setTimeout(() => {
        setSelf(false);
      }, duration_ms);
    };

    onSet(() => {
      setTimer();
    });

    return () => {
      clearTimeout(timerId);
    };
  };

// Define a top menu state atom with a timer effect
export const topMenuState = atom<boolean>({
  key: 'TopMenuState',
  default: false,
  effects: [
    timerEffect(
      parseInt(process.env.EXPO_PUBLIC_TOP_MENU_HIDE_DURATION_MS || '5000', 10),
    ),
  ],
});
