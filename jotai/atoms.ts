import { observe } from 'jotai-effect';

import { TafseerTabs } from '@/types';
import { Riwaya } from '@/types/riwaya';

import { createAtomWithStorage } from './createAtomWithStorage';

export const bottomMenuState = createAtomWithStorage<boolean>(
  'BottomMenuState',
  true,
);
export const advancedSearch = createAtomWithStorage<boolean>(
  'AdvancedSearch',
  false,
);
export const currentSavedPage = createAtomWithStorage<number>(
  'CurrentSavedPage',
  1,
);
export const finishedTutorial = createAtomWithStorage<boolean | undefined>(
  'FinishedTutorial',
  undefined,
);
export const mushafRiwaya = createAtomWithStorage<Riwaya | undefined>(
  'MushafRiwaya',
  undefined,
);
export const tafseerTab = createAtomWithStorage<TafseerTabs>(
  'TafseerTab',
  'katheer',
);
export const flipSound = createAtomWithStorage<boolean>('FlipSound', false);
export const currentAppVersion = createAtomWithStorage<string | undefined>(
  'CurrentAppVersion',
  undefined,
);
export const mushafContrast = createAtomWithStorage<number>(
  'MushafContrast',
  0.5,
);
export const hizbNotification = createAtomWithStorage<number>(
  'HizbNotification',
  0,
);
export const dailyTrackerGoal = createAtomWithStorage<number>(
  'DailyTrackerGoal',
  1,
);
export const showTrackerNotification = createAtomWithStorage<boolean>(
  'ShowTrackerNotification',
  false,
);

// Type declarations
type DailyTrackerProgress = {
  value: number;
  date: string;
};

// Daily tracker with reset if date changed
export const dailyTrackerCompleted =
  createAtomWithStorage<DailyTrackerProgress>('DailyTrackerCompleted', {
    value: 0,
    date: new Date().toDateString(),
  });

observe((get, set) => {
  const storedPromise = get(dailyTrackerCompleted);
  const today = new Date().toDateString();

  const stored = (
    storedPromise instanceof Promise
      ? storedPromise.then((value) => value)
      : storedPromise
  ) as PageWithDate;

  if (stored.date !== today) {
    set(dailyTrackerCompleted, { value: 0, date: today });
  }
});

// Yesterday page logic with async init and sync to currentSavedPage
type PageWithDate = {
  value: number;
  date: string;
};

export const yesterdayPage = createAtomWithStorage<PageWithDate>(
  'YesterdayPage',
  {
    value: 1,
    date: new Date().toDateString(),
  },
);

// Yesterday page reset logic
observe((get, set) => {
  const today = new Date().toDateString();
  const savedPromise = get(yesterdayPage);
  const lastPagePromize = get(currentSavedPage);

  const saved = (
    savedPromise instanceof Promise
      ? savedPromise.then((value) => value)
      : savedPromise
  ) as PageWithDate;
  const lastPage = (
    lastPagePromize instanceof Promise
      ? lastPagePromize.then((value) => value)
      : lastPagePromize
  ) as number;

  if (saved.date !== today) {
    set(yesterdayPage, { value: lastPage, date: today });
  }
});

// Top menu persist atom
export const topMenuState = createAtomWithStorage<boolean>(
  'TopMenuState',
  false,
);

// Top menu auto-hide effect
observe((get, set) => {
  const duration = parseInt(
    process.env.EXPO_PUBLIC_TOP_MENU_HIDE_DURATION_MS || '5000',
    10,
  );
  if (get(topMenuState)) {
    const timerId = setTimeout(() => {
      set(topMenuState, false);
    }, duration);

    return () => clearTimeout(timerId);
  }
});

// ReadingPositionBanner
export const readingBannerCollapsedState = createAtomWithStorage<boolean>(
  'ReadingBannerCollapsedState',
  false,
);
