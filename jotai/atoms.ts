import { observe } from 'jotai-effect';

import { CHART_PERIODS } from '@/constants';
import { Reminder, TafseerTabs } from '@/types';
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
export const panGestureSensitivity = createAtomWithStorage<number>(
  'PanGestureSensitivity',
  1.0,
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

export type DailyReadingRecord = {
  hizbsCompleted: number;
  pagesRead: number;
  date: string;
};

export const readingHistory = createAtomWithStorage<DailyReadingRecord[]>(
  'ReadingHistory',
  [],
);

observe((get, set) => {
  const stored = get(dailyTrackerCompleted);
  const history = get(readingHistory);
  const today = new Date().toDateString();

  if (stored.date !== today) {
    const savedYesterday = get(yesterdayPage) as PageWithDate;
    const lastPage = get(currentSavedPage) as number;
    const pagesRead = Math.max(0, lastPage - savedYesterday.value);

    if (stored.value > 0 || pagesRead > 0) {
      const entry: DailyReadingRecord = {
        hizbsCompleted: stored.value,
        pagesRead,
        date: stored.date,
      };

      const currentIndex = history.findIndex(
        (record: DailyReadingRecord) => record.date === stored.date,
      );

      const updatedHistory =
        currentIndex !== -1
          ? [
              ...history.slice(0, currentIndex),
              {
                ...entry,
                hizbsCompleted: Math.max(
                  entry.hizbsCompleted,
                  history[currentIndex].hizbsCompleted,
                ),
                pagesRead: Math.max(
                  entry.pagesRead,
                  history[currentIndex].pagesRead,
                ),
              },
              ...history.slice(currentIndex + 1),
            ]
          : [...history, entry];

      set(
        readingHistory,
        updatedHistory.slice(-CHART_PERIODS[CHART_PERIODS.length - 1].days),
      );
    }
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
  (async () => {
    const today = new Date().toDateString();
    const saved = await get(yesterdayPage);
    const lastPage = await get(currentSavedPage);

    if (saved.date !== today) {
      set(yesterdayPage, { value: lastPage, date: today });
    }
  })();
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

// Swipe sensitivity (index into SENSITIVITY_MULTIPLIERS: 0=sensitive, 1=default, 2=steady)
export const swipeSensitivity = createAtomWithStorage<number>(
  'SwipeSensitivity',
  1,
);

// Reading theme: 'default' | 'sepia' | 'highContrast'
export const readingTheme = createAtomWithStorage<string>(
  'ReadingTheme',
  'default',
);

// ReadingPositionBanner
export const readingBannerCollapsedState = createAtomWithStorage<boolean>(
  'ReadingBannerCollapsedState',
  false,
);

// Reading reminders
const DEFAULT_REMINDERS: Reminder[] = [
  {
    id: 'preset-wird',
    title: 'الورد اليومي',
    body: 'حان وقت قراءة وردك اليومي',
    enabled: false,
    hour: 20,
    minute: 0,
    type: 'daily',
    preset: 'wird',
  },
  {
    id: 'preset-mulk',
    title: 'سورة الملك',
    body: 'لا تنسَ قراءة سورة الملك قبل النوم',
    enabled: false,
    hour: 21,
    minute: 0,
    type: 'daily',
    preset: 'mulk',
  },
  {
    id: 'preset-kahf',
    title: 'سورة الكهف',
    body: 'لا تنسَ قراءة سورة الكهف — يوم الجمعة',
    enabled: false,
    hour: 10,
    minute: 0,
    type: 'weekly',
    dayOfWeek: 6,
    preset: 'kahf',
  },
];

export const remindersAtom = createAtomWithStorage<Reminder[]>(
  'Reminders',
  DEFAULT_REMINDERS,
);

// Multi-bookmark system
export type Bookmark = {
  id: string;
  page: number;
  label: string;
  createdAt: string;
};

export const bookmarks = createAtomWithStorage<Bookmark[]>('Bookmarks', []);
