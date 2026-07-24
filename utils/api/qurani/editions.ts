/**
 * Wrapper for the qurani.ai `/edition` endpoint.
 *
 * Editions are filterable by `language`, `type` (quran / translation /
 * tafsir / narration / audio), and `format` (text / audio). Returns
 * the full list and lets callers narrow in-memory for prefix matches.
 */

import { quraniGet } from './client';
import type { QuranApiEdition } from './types';

export type EditionFilters = {
  language?: string;
  type?: QuranApiEdition['type'];
  format?: QuranApiEdition['format'];
  /** Free-form identifier prefix (e.g. `quran-` to keep only Quran editions). */
  identifierPrefix?: string;
};

/**
 * List every qurani.ai edition matching the given filters. The
 * endpoint returns ~150–300 entries depending on filters; the result
 * is cached at `Paths.document/api/editions.json` (Phase 2).
 */
export async function listEditions(
  filters: EditionFilters = {},
  signal?: AbortSignal,
): Promise<QuranApiEdition[]> {
  const qs = new URLSearchParams();
  if (filters.language) qs.set('language', filters.language);
  if (filters.type) qs.set('type', filters.type);
  if (filters.format) qs.set('format', filters.format);
  const path = `/edition${qs.toString() ? `?${qs.toString()}` : ''}`;

  const list = await quraniGet<QuranApiEdition[]>(path, { signal });
  if (filters.identifierPrefix) {
    const p = filters.identifierPrefix;
    return list.filter((e) => e.identifier.startsWith(p));
  }
  return list;
}
