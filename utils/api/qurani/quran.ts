/**
 * Typed wrappers for the qurani.ai Quran endpoints.
 *
 * `getCompleteQuran(edition)` returns the entire Quran in one ~2 MB
 * response. We use it to populate the per-narration cache on first
 * launch. `getPage(n, edition)` returns the verses that appear on
 * mushaf page N — used by the per-page text renderer.
 *
 * Reference: https://qurani.ai/en/docs/1-general-apis
 */

import { quraniGet } from './client';
import type { QuranApiAyah, QuranApiPage, QuranApiSurah } from './types';

/** Response shape for `/quran/{edition}` — wraps the surahs
 *  array under `data.surahs` plus the edition metadata. */
type CompleteQuranResponse = {
  surahs: QuranApiSurah[];
  edition?: unknown;
};

/**
 * Returns 6236 ayahs across 114 surahs for the given narration edition.
 * For example, `getCompleteQuran('quran-hafs')` returns the Hafs /
 * Asim narration text.
 */
export const getCompleteQuran = async (
  edition: string,
  signal?: AbortSignal,
): Promise<QuranApiSurah[]> => {
  const response = await quraniGet<CompleteQuranResponse>(
    `/quran/${encodeURIComponent(edition)}`,
    { signal },
  );
  return response.surahs;
};

/**
 * Returns the full surah for `n` (1..114). When `edition` is omitted
 * the API picks its default (quran-uthmani today).
 */
export const getSurah = (
  n: number,
  edition?: string,
  signal?: AbortSignal,
): Promise<QuranApiSurah> =>
  quraniGet<QuranApiSurah>(
    `/surah/${n}${edition ? `/${encodeURIComponent(edition)}` : ''}`,
    { signal },
  );

/**
 * Returns all ayahs on mushaf page `n` (1..604 for the supported
 * riwayas), with `topPageSurah`, `topPageJuz`, and `hizbNumbers` for
 * inline header rendering.
 */
export const getPage = (
  n: number,
  edition: string,
  signal?: AbortSignal,
): Promise<QuranApiPage> =>
  quraniGet<QuranApiPage>(`/page/${n}/${encodeURIComponent(edition)}`, {
    signal,
  });

/**
 * Returns a single ayah. `ref` may be the global id (`262`) or the
 * `(surah:ayah)` tuple (`"2:255"`). When `edition` is omitted the API
 * returns the default edition (quran-uthmani).
 */
export const getAyah = (
  ref: number | `${number}:${number}`,
  edition?: string,
  signal?: AbortSignal,
): Promise<QuranApiAyah> =>
  quraniGet<QuranApiAyah>(
    `/ayah/${ref}${edition ? `/${encodeURIComponent(edition)}` : ''}`,
    { signal },
  );
