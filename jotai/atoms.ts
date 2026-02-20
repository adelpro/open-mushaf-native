import { observe } from 'jotai-effect';

import { Reminder, TafseerTabs } from '@/types';
import { Riwaya } from '@/types/riwaya';
import { formatDateKey } from '@/utils/hizbProgress';

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

// Reading history — stores up to 90 days of daily hizb counts
export type DailyReadingRecord = {
  date: string;
  hizbsCompleted: number;
};

export const MAX_HISTORY_DAYS = 90;

export const readingHistory = createAtomWithStorage<DailyReadingRecord[]>(
  'ReadingHistory',
  [],
);

// Daily tracker with reset if date changed
export const dailyTrackerCompleted =
  createAtomWithStorage<DailyTrackerProgress>('DailyTrackerCompleted', {
    value: 0,
    date: formatDateKey(new Date()),
  });

// Archive yesterday's reading before resetting the daily counter
observe((get, set) => {
  (async () => {
    const stored = await get(dailyTrackerCompleted);
    const today = formatDateKey(new Date());

    if (stored.date !== today) {
      // Archive the previous day's data if there was any reading
      if (stored.value > 0) {
        const history = await get(readingHistory);
        const existingIndex = history.findIndex((r) => r.date === stored.date);
        const entry = { date: stored.date, hizbsCompleted: stored.value };
        const updated =
          existingIndex >= 0
            ? history.map((r, i) =>
                i === existingIndex
                  ? {
                      ...r,
                      hizbsCompleted: Math.max(
                        r.hizbsCompleted,
                        entry.hizbsCompleted,
                      ),
                    }
                  : r,
              )
            : [...history, entry].slice(-MAX_HISTORY_DAYS);
        set(readingHistory, updated);
      }

      set(dailyTrackerCompleted, { value: 0, date: today });
    }
  })();
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
    date: formatDateKey(new Date()),
  },
);

// Yesterday page reset logic
observe((get, set) => {
  (async () => {
    const today = formatDateKey(new Date());
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
