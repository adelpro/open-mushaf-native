import ReactNativeRecoilPersist from 'react-native-recoil-persist';
import { atom } from 'recoil';

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
export const dailyTrackerGoal = atom<number>({
  key: 'DailyTrackerGoal',
  default: 1,
  effects: [ReactNativeRecoilPersist.persistAtom],
});
// Store the last date the app was used
export const lastUsedDate = atom<string>({
  key: 'LastUsedDate',
  default: new Date().toDateString(),
  effects: [ReactNativeRecoilPersist.persistAtom],
});

export const showTrackerNotification = atom<boolean>({
  key: 'ShowTrackerNotification',
  default: false,
  effects: [ReactNativeRecoilPersist.persistAtom],
});

// Type for the daily hizb tracking
type DailyTrackerProgress = {
  value: number;
  date: string;
};

export const dailyTrackerCompleted = atom<DailyTrackerProgress>({
  key: 'DailyTrackerCompleted',
  default: {
    value: 0,
    date: new Date().toDateString(),
  },
  effects: [
    ReactNativeRecoilPersist.persistAtom,
    // Effect to reset the value if the date changes (new day)
    ({ setSelf, onSet }) => {
      const todayString = new Date().toDateString();

      // This runs immediately during initialization
      setSelf((currentValue) => {
        // Check if it's a DefaultValue (initial state)
        if (!(currentValue instanceof Object) || !('date' in currentValue)) {
          return {
            value: 0,
            date: todayString,
          };
        }

        // If the stored date is not today, reset the value
        if (currentValue.date !== todayString) {
          return {
            value: 0,
            date: todayString,
          };
        }
        // Otherwise keep the current value
        return currentValue;
      });

      // Also check date on every set operation
      onSet((newValue) => {
        const currentDate = new Date().toDateString();
        // Make sure newValue is not a DefaultValue
        if (newValue instanceof Object && 'date' in newValue) {
          // If the date in the new value is outdated, force an update
          if (newValue.date !== currentDate) {
            setSelf({
              value: 0,
              date: currentDate,
            });
          }
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
  key: 'YesterdayPage',
  default: {
    value: 1, // Default to page 1
    date: new Date().toDateString(), // Initialize with today's date
  },
  effects: [
    ReactNativeRecoilPersist.persistAtom,
    // Effect to update the 'yesterday page' value when a new day starts on initialization
    ({ setSelf, getPromise }) => {
      const initializeOrUpdate = async () => {
        const todayString = new Date().toDateString();
        try {
          // Get the potentially persisted value for yesterdayPage
          const persistedYesterdayPage = await getPromise(yesterdayPage);
          // Get the actual last saved page from the previous session
          const lastSavedPage = await getPromise(currentSavedPage);

          // If the stored date is not today, it means a new day has started.
          if (persistedYesterdayPage.date !== todayString) {
            // Update yesterdayPage's value to the last page saved *before* today,
            // and set the date to today.
            setSelf({
              value: lastSavedPage, // Use the page saved from the previous session
              date: todayString,
            });
          }
          // If the date is already today, Recoil uses the persisted value.
        } catch (error) {
          // Handle potential errors during async storage read
          console.error(
            'Error reading persisted yesterdayPage/currentSavedPage:',
            error,
          );
          // Fallback: Set yesterday's page to 1 and date to today
          setSelf({ value: 1, date: todayString });
        }
      };

      // Run this check when the atom is initialized/app starts
      initializeOrUpdate();
    },
  ],
});

// Define a top menu state atom with a timer effect
export const topMenuState = atom<boolean>({
  key: 'TopMenuState',
  default: false,
  effects: [
    ({ setSelf, onSet }) => {
      const duration_ms = parseInt(
        process.env.EXPO_PUBLIC_TOP_MENU_HIDE_DURATION_MS || '5000',
        10,
      );
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
    },
  ],
});
