/**
 * Stand-in shape definitions for the legacy `QuranText` and
 * `MorphologyAya` types that the search screen and other modules
 * still reference. After Phase 5 the live data comes from
 * `utils/api/qurani/`; these types are kept narrow to satisfy
 * remaining imports without re-introducing the quran-search-engine
 * dependency.
 *
 * Real-shape consumers should import from
 * `utils/api/qurani` (e.g. `QuranApiAyah`) instead.
 */

export type QuranText = {
  gid: number;
  sura_id: number;
  aya_id: number;
  aya_id_display: string;
  uthmani: string;
  standard: string;
  standard_full: string;
  page_id: number;
  juz_id: number;
  sura_name: string;
  sura_name_en: string;
  sura_name_romanization: string;
};

export type MorphologyAya = {
  gid: number;
  segments: {
    text: string;
    lemma?: string;
    root?: string;
    pos?: string;
  }[];
};
