import AsyncStorage from '@react-native-async-storage/async-storage';
import { add, formatISO } from 'date-fns';
import { atomWithStorage, createJSONStorage } from 'jotai/utils';
import { withAtomEffect } from 'jotai-effect';

import { TafseerTabs } from '@/types';

const atomWithAsyncStorage = <T>(key: string, initialValue: T) => {
  const storage = createJSONStorage<T>(() => AsyncStorage);

  // preserve original getItem and setItem
  const originalGetItem = storage.getItem;
  const originalSetItem = storage.setItem;

  // override setItem
  storage.setItem = async (_, value, expireInHours?: number) => {
    let updatedValue = value;

    // add expireAt to newValue if expireInHours is provided
    if (expireInHours !== undefined) {
      const expireAt = add(new Date(), { hours: expireInHours });
      updatedValue = { ...value, expireAt: formatISO(expireAt) };
    }

    // updatedValue is a JSON object -- createJSONStorage handles that for us
    // call original setItem with updatedValue
    return originalSetItem.call(storage, key, updatedValue);
  };

  // override getItem
  storage.getItem = async () => {
    // call original getItem
    const value = await originalGetItem.call(storage, key, initialValue);

    // value is already a JSON object -- createJSONStorage handles that for us
    return value;
  };

  return atomWithStorage(key, initialValue, storage);
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
 *  1 - hizb
 *  2 - juz
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

currentAppVersion.debugLabel = 'current-app- version';

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
finishedTutorial.debugLabel = 'finiched-tutorial';

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
      return () => clearTimeout(timerId);
    }
  },
);
topMenuStateWithEffect.debugLabel = 'top-menu-state-with-effect';
