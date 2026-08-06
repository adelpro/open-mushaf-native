import { atom } from 'jotai';
import { observe } from 'jotai-effect';

import { Reminder, TafseerTabs } from '@/types';
import { Riwaya } from '@/types/riwaya';

import { createAtomWithStorage } from './createAtomWithStorage';

// ---------------------------------------------------------------------------
// AI semantic search (Phase 4 of the AI search plan)
// ---------------------------------------------------------------------------

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
export const mushafRiwaya = createAtomWithStorage<Riwaya>(
  'MushafRiwaya',
  'hafs',
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
  // Only populated for weekly-aggregated records so the chart can render
  // "D-D" range labels. Absent on raw daily entries in `readingHistory`.
  weekStart?: string;
  // 1..7; <7 means the bucket is a partial week (only happens for the
  // trailing bucket when the period isn't a multiple of 7).
  daysInBucket?: number;
  // `true` when this slot has a real record (either from `readingHistory`
  // or from today's `dailyTrackerCompleted`). `false` when the slot was
  // padded with zeros because the user wasn't tracking yet. Drives the
  // "no record" visual treatment and the average calculation so a user
  // who started tracking 22 days ago doesn't see their stats diluted by
  // 68 untracked days in a 90-day window.
  hasRecord?: boolean;
};

export const readingHistory = createAtomWithStorage<DailyReadingRecord[]>(
  'ReadingHistory',
  [],
);

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

/// Top menu persist atom
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

/** User opt-out for the AI tab inside /search. When true, SearchModeToggle hides the AI option. */
export const aiSearchHidden = createAtomWithStorage<boolean>(
  'AiSearchHidden',
  false,
);

/**
 * The active search mode for the /search screen.
 * Persisted so the user's last choice is restored on next visit.
 */
export const searchMode = createAtomWithStorage<'keyword' | 'ai'>(
  'SearchMode',
  'keyword',
);

/** Transient — model download / load state. Not persisted (recomputed each session). */
export type AiModelStatus = 'idle' | 'downloading' | 'ready' | 'error';

export const aiSearchModelStatus = atom<AiModelStatus>('idle');

export type AiDownloadProgress = {
  bytesDownloaded: number;
  totalBytes: number;
};

export const aiSearchDownloadProgress = atom<AiDownloadProgress | null>(null);

/** Last error from the AI pipeline (shown in a banner). Cleared on next successful query. */
export const aiSearchLastError = atom<string | null>(null);
