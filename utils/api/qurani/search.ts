/**
 * Typed wrapper for qurani.ai's `/search` endpoint.
 *
 * Signature (live-verified):
 *
 *   GET /search/<keyword>?<edition>&size=N&page=M
 *
 * Returns a paged list of ayahs matching `keyword`, with full
 * ayah metadata. The response shape includes `count` (total
 * matches) plus `ayahs[]` for the requested page.
 *
 * Search is online-only. The endpoint powers both Arabic and
 * non-Arabic queries; the API auto-detects via the `isArabic`
 * field in the response.
 *
 * Reference: https://qurani.ai/en/docs/1-general-apis
 */

import { quraniGet } from './client';
import type {
  QuranApiAyah,
  QuranApiEdition,
  QuranApiSurahHeader,
} from './types';

/**
 * Narrowed shape of `ayahs[]` — the API returns the full
 * `QuranApiAyah` for every match, including the surah metadata
 * inline. We re-export the type so callers don't need to reach
 * into the qurani module.
 */
export type SearchHit = QuranApiAyah;

export type QuranApiSearchResponse = {
  keyword: string;
  normalizedKeyword: string;
  isArabic: boolean;
  exactSearch: boolean;
  searchType: 'exact' | 'fuzzy' | 'semantic' | string;
  /** Total matches across all pages. */
  count: number;
  /** The verses for the requested page. */
  ayahs: SearchHit[];
  /** Surahs that have at least one match (for inline headers). */
  surahs: QuranApiSurahHeader[];
  /** The edition that was searched. */
  edition: QuranApiEdition;
};

export type SearchOptions = {
  /** Narration/translation edition id (e.g. `quran-hafs`, `en.sahih`). */
  edition: string;
  /** Page size (1..50). */
  size?: number;
  /** Page index (1-based). */
  page?: number;
};

const DEFAULT_SIZE = 20;

/**
 * Search the Quran for `keyword` in the given `edition`.
 *
 * Returns the typed response; callers handle `count === 0` and
 * pagination. Throws `QuranApiError` on any failure.
 */
export const searchQuran = (
  keyword: string,
  options: SearchOptions,
  signal?: AbortSignal,
): Promise<QuranApiSearchResponse> => {
  const trimmed = keyword.trim();
  if (!trimmed) {
    return Promise.resolve({
      keyword: trimmed,
      normalizedKeyword: trimmed,
      isArabic: false,
      exactSearch: true,
      searchType: 'exact',
      count: 0,
      ayahs: [],
      surahs: [],
      edition: { identifier: options.edition } as QuranApiEdition,
    });
  }
  const qs = new URLSearchParams();
  qs.set('edition', options.edition);
  if (options.size) qs.set('size', String(options.size));
  if (options.page) qs.set('page', String(options.page));
  return quraniGet<QuranApiSearchResponse>(
    `/search/${encodeURIComponent(trimmed)}?${qs.toString()}`,
    { signal },
  );
};

/** Default page size for the search screen. */
export const SEARCH_DEFAULT_PAGE_SIZE = DEFAULT_SIZE;
