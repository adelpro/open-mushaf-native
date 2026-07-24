/**
 * App-side types for the qurani.ai narration cache.
 *
 * `QuranApiText` is the *flat* shape persisted on disk. The wire
 * format from qurani.ai (`QuranApiAyah`, defined in
 * `utils/api/qurani/types.ts`) is nested — verses live inside
 * surahs. `useNarrationCache` flattens that once at download time so
 * per-gid lookups stay O(1) without re-walking the surah tree.
 */

export type QuranApiText = {
  /** Global ayah index — Hafs-canonical, 1..6236. */
  gid: number;
  /** Surah number, 1..114. */
  surah: number;
  /** Per-narration per-surah number (Hafs Fatiha 1:1 = Bismillah, Warsh 1:1 = الحمد لله). */
  numberInSurah: number;
  /** Mushaf page, 1..604. */
  page: number;
  /** Juz, 1..30. */
  juz: number;
  /** Hizb quarter, 1..240. */
  hizbQuarter: number;
  /** Manzil, 1..7. */
  manzil: number;
  /** Ruku, 1..556. */
  ruku: number;
  /** Uthmani verse text. */
  text: string;
  /** Sajda marker — `false` for non-sajda ayahs. */
  sajda: false | { id: number; recommended: boolean; obligatory: boolean };
};

/** Per-page snapshot — a smaller working set than the full quran.json. */
export type QuranApiPageBundle = {
  page: number;
  topPageSurah: number;
  topPageJuz: number;
  hizbNumbers: number[];
  /** gid-keyed ayah metadata for every verse on this page. */
  ayahs: QuranApiText[];
};
