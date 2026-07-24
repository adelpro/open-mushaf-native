import { observe } from 'jotai-effect';

import { TafseerKey } from '@/constants/TafseerCdn';
import type { TranslationKey } from '@/constants/translations';
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

// Note on migration: the previous SVG-era build stored downloaded
// riwayas under the `DownloadedRiwayat` MMKV key (a `Riwaya[]`).
// That storage key is no longer read anywhere — the qurani.ai
// integration has not yet shipped, so no users have live data
// to migrate. When the new build ships, the wizard re-runs for
// everyone (because `firstLaunchDone` is empty), so even if a
// user somehow had old data on disk, the cache layer will
// re-download from qurani.ai on first run.

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

// Offline-downloads module. The "Downloaded*" lists are the source of
// truth for "what is offline-ready" — the on-disk filesystem state is
// authoritative for byte counts, but the lists make queries cheap and
// reactive. `firstLaunchSeenDownloads` controls the first-launch
// checklist popup.
export const downloadedRiwaya = createAtomWithStorage<Riwaya[]>(
  'DownloadedRiwaya',
  [],
);
export const downloadedTafseers = createAtomWithStorage<TafseerKey[]>(
  'DownloadedTafseers',
  [],
);
export const firstLaunchSeenDownloads = createAtomWithStorage<boolean>(
  'FirstLaunchSeenDownloads',
  false,
);

// ────── Phase 1: qurani.ai first-launch wizard state ──────
//
// The first-launch flow (see `app/(first-launch)/index.tsx`) blocks
// the home tab until the user has picked a riwaya and downloaded its
// Quran text from qurani.ai. `firstLaunchDone` flips to true once
// the wizard succeeds — it never re-arms on its own. Re-downloading
// a different riwaya from the Downloads page does NOT toggle it.
//
// `downloadedRiwaya` tracks which riwayas are on disk
// (e.g. `['hafs', 'warsh']`). It is informational — the
// actual disk state lives under
// `Paths.document/open-mushaf/api/<riwaya>/`, and
// `isRiwayaBundleCached(riwaya)` is the source of truth at read
// time. The atom exists so consumers (badges, progress UI) can
// reactively re-render when a download completes without polling
// the filesystem.
//
// `lastSelectedRiwaya` lets the app re-open in the user's last-used
// riwaya even if the wizard hasn't completed yet — useful when the
// user is partway through a multi-step download flow.
//
// `quranApiCacheVersion` lets us invalidate the cached narration
// bundle if the qurani.ai response schema drifts in a way that
// changes the shape we rely on (e.g. adding a new top-level field).
export const firstLaunchDone = createAtomWithStorage<boolean>(
  'FirstLaunchDone',
  false,
);
export const lastSelectedRiwaya = createAtomWithStorage<Riwaya | undefined>(
  'LastSelectedRiwaya',
  undefined,
);
export const quranApiCacheVersion = createAtomWithStorage<number>(
  'QuranApiCacheVersion',
  1,
);

// ────── Phase 4: translation selection state ──────
//
// `selectedTranslation` is the translation the Tafseer popup renders
// below the Arabic tafseer text (if the corresponding JSON is
// downloaded). `null` means "show no translation" — useful for users
// who read Arabic natively or are offline.
//
// `downloadedTranslations` is informational — the actual disk state
// lives under `Paths.document/open-mushaf/translation/<id>.json`,
// and `isTranslationCached(id)` is the source of truth at read time.
export const selectedTranslation = createAtomWithStorage<TranslationKey | null>(
  'SelectedTranslation',
  null,
);
export const downloadedTranslations = createAtomWithStorage<TranslationKey[]>(
  'DownloadedTranslations',
  [],
);
