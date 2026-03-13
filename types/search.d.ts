/**
 * Aligned with quran-search-engine package types for future import compatibility.
 * TODO: replace with:
 * import type { AdvancedSearchOptions, SearchOptions } from 'quran-search-engine';
 */

export type AdvancedSearchOptions = {
  /** If true, expands search scope matching lemma forms. */
  lemma: boolean;
  /** If true, expands search scope matching root structures. */
  root: boolean;
  /** If true, permits typographical fuzzy matching. */
  fuzzy?: boolean;
  /** If true, treats query as a regular expression. */
  isRegex?: boolean;
  /** Restricts search to a specific Surah ID. */
  suraId?: number;
  /** Restricts search to a specific Juz ID. */
  juzId?: number;
  /** Restricts search to a specific Surah Name. */
  suraName?: string;
  /** English surah name for matching. */
  sura_name_en?: string;
  /** Romanized surah name for matching. */
  sura_name_romanization?: string;
  /** If true, enables semantic search capabilities. */
  semantic?: boolean;
};

/** Shared alias for global search configurations. */
export type SearchOptions = AdvancedSearchOptions;
