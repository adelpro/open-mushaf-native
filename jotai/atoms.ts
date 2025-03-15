import AsyncStorage from '@react-native-async-storage/async-storage';
import { add, formatISO, isBefore, parseISO } from 'date-fns';
import { atomWithStorage, createJSONStorage } from 'jotai/utils';
import { withAtomEffect } from 'jotai-effect';

import { TafseerTabs } from '@/types';

type WrappedValue<T> = {
  data: T;
  expireAt?: string;
};

const atomWithAsyncStorage = <T>(key: string, initialValue: T) => {
  const rawStorage = createJSONStorage<WrappedValue<T>>(() => AsyncStorage);

  const storageAdapter = {
    getItem: async (key: string, defaultValue: T): Promise<T> => {
      const wrappedDefault: WrappedValue<T> = {
        data: defaultValue,
        expireAt: undefined,
      };
      const stored = await rawStorage.getItem(key, wrappedDefault);
      if (stored.expireAt && isBefore(parseISO(stored.expireAt), new Date())) {
        // Expired – remove the stored item and return the default value.
        await rawStorage.removeItem(key);
        return defaultValue;
      }
      return stored.data;
    },
    setItem: async (
      key: string,
      newValue: T,
      expireInHours?: number,
    ): Promise<void> => {
      const wrapped: WrappedValue<T> = {
        data: newValue,
        expireAt: expireInHours
          ? formatISO(add(new Date(), { hours: expireInHours }))
          : undefined,
      };
      return rawStorage.setItem(key, wrapped);
    },
    removeItem: rawStorage.removeItem.bind(rawStorage),
  };

  return atomWithStorage(key, initialValue, storageAdapter);
};

export const bottomMenuState = atomWithAsyncStorage<boolean>(
  'BottomMenuState',
  true,
);
bottomMenuState.debugLabel = 'bottom-menu-state';

export const currentSavedPage = atomWithAsyncStorage<number>(
  'CurrentSavedPage',
  1,
);
currentSavedPage.debugLabel = 'current-saved-page';

export const tafseerTab = atomWithAsyncStorage<TafseerTabs>(
  'TafseerTab',
  'katheer',
);
tafseerTab.debugLabel = 'tafseer-tab';

export const flipSound = atomWithAsyncStorage<boolean>('FlipSound', false);
flipSound.debugLabel = 'flip-sound';

export const mushafContrast = atomWithAsyncStorage<number>(
  'MushafContrast',
  0.5,
);
mushafContrast.debugLabel = 'mushaf-contrast';

/**
 * 0 - disabled
 * 1 - hizb
 * 2 - juz
 */
export const hizbNotification = atomWithAsyncStorage<number>(
  'HizbNotification',
  0,
);
hizbNotification.debugLabel = 'hizb-notification';

export const currentAppVersion = atomWithAsyncStorage<string | undefined>(
  'CurrentAppVersion',
  undefined,
);
currentAppVersion.debugLabel = 'current-app-version';

/**
 * 0 - warsh
 * 1 - hafs
 * undefined
 */
export const MushafRiwaya = atomWithAsyncStorage<number | undefined>(
  'MushafRiwaya',
  undefined,
);
MushafRiwaya.debugLabel = 'mushaf-riwaya';

export const finishedTutorial = atomWithAsyncStorage<boolean>(
  'FinishedTutorial',
  false,
);
finishedTutorial.debugLabel = 'finished-tutorial';

// Define a top menu state atom with a timer effect
const topMenuState = atomWithAsyncStorage<boolean>('TopMenuState', false);
topMenuState.debugLabel = 'top-menu-state';

export const topMenuStateWithEffect = withAtomEffect(
  topMenuState,
  (get, set) => {
    if (get(topMenuState)) {
      const durationMs = parseInt(
        process.env.EXPO_PUBLIC_TOP_MENU_HIDE_DURATION_MS || '5000',
        10,
      );
      const timerId = setTimeout(() => {
        if (get(topMenuState)) {
          set(topMenuState, false);
        }
      }, durationMs);

      return () => {
        clearTimeout(timerId);
      };
    }
  },
);
topMenuStateWithEffect.debugLabel = 'top-menu-state-with-effect';
