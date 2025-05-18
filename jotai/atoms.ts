// store/state.ts
import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';

import { TafseerTabs } from '@/types';
import { Riwaya } from '@/types/riwaya';

// Basic persisted atoms
export const bottomMenuState = atomWithStorage<boolean>(
  'BottomMenuState',
  true,
);
export const advancedSearch = atomWithStorage<boolean>('AdvancedSearch', false);
export const currentSavedPage = atomWithStorage<number>('CurrentSavedPage', 1);
export const finishedTutorial = atomWithStorage<boolean | undefined>(
  'FinishedTutorial',
  undefined,
);
export const mushafRiwaya = atomWithStorage<Riwaya | undefined>(
  'MushafRiwaya',
  undefined,
);
export const tafseerTab = atomWithStorage<TafseerTabs>('TafseerTab', 'katheer');
export const flipSound = atomWithStorage<boolean>('FlipSound', false);
export const currentAppVersion = atomWithStorage<string | undefined>(
  'CurrentAppVersion',
  undefined,
);
export const mushafContrast = atomWithStorage<number>('MushafContrast', 0.5);
export const hizbNotification = atomWithStorage<number>('HizbNotification', 0);
export const dailyTrackerGoal = atomWithStorage<number>('DailyTrackerGoal', 1);
export const showTrackerNotification = atomWithStorage<boolean>(
  'ShowTrackerNotification',
  false,
);

// Type declarations
type DailyTrackerProgress = {
  value: number;
  date: string;
};

// Daily tracker with reset if date changed
const baseDailyTrackerCompleted = atomWithStorage<DailyTrackerProgress>(
  'DailyTrackerCompleted',
  { value: 0, date: new Date().toDateString() },
);

export const dailyTrackerCompleted = atom(
  (get) => {
    const stored = get(baseDailyTrackerCompleted);
    const today = new Date().toDateString();

    return stored.date === today ? stored : { value: 0, date: today };
  },
  (get, set, next: DailyTrackerProgress) => {
    const today = new Date().toDateString();

    set(
      baseDailyTrackerCompleted,
      next.date === today ? next : { value: 0, date: today },
    );
  },
);

// Yesterday page logic with async init and sync to currentSavedPage
type PageWithDate = {
  value: number;
  date: string;
};

const baseYesterdayPage = atomWithStorage<PageWithDate>('YesterdayPage', {
  value: 1,
  date: new Date().toDateString(),
});

export const yesterdayPage = atom(
  async (get) => {
    const today = new Date().toDateString();
    const saved = get(baseYesterdayPage);
    const lastPage = get(currentSavedPage);

    if (saved.date !== today) {
      return { value: lastPage, date: today };
    }
    return saved;
  },
  (get, set, _update?: unknown) => {
    const today = new Date().toDateString();
    const lastPage = get(currentSavedPage);
    set(baseYesterdayPage, { value: lastPage, date: today });
  },
);

// Top menu auto-hide atom with timer
export const topMenuState = atom<boolean>(false);

export const topMenuStateWithTimer = atom(
  (get) => get(topMenuState),
  (get, set, show: boolean) => {
    const duration = parseInt(
      process.env.EXPO_PUBLIC_TOP_MENU_HIDE_DURATION_MS || '5000',
      10,
    );

    set(topMenuState, show);

    if (show) {
      setTimeout(() => {
        set(topMenuState, false);
      }, duration);
    }
  },
);

// ReadingPositionBanner
export const readingBannerCollapsedState = atomWithStorage<boolean>(
  'ReadingBannerCollapsedState',
  false,
);
