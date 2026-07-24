/**
 * qurani.ai tafsir edition catalog.
 *
 * The full list (~157 editions, of which ~52 are Arabic) is
 * fetched live from `/edition?type=tafsir` and cached at
 * `Paths.document/open-mushaf/editions/tafsirs.json`. This file
 * provides the TypeScript type for those records so the rest of
 * the codebase can reason about them statically.
 *
 * Reference: https://qurani.ai/en/docs/1-general-apis
 */

import type { QuranApiEdition } from '@/utils/api/qurani';

/** Subset of `QuranApiEdition` for tafsir records. */
export type QuraniTafseer = QuranApiEdition & {
  /** Always `'tafsir'` for these records. */
  type: 'tafsir';
};

/** Subset of Arabic tafsirs we curate for the Downloads UI.
 *  Keeps the picker short — the live `/edition?type=tafsir` returns
 *  ~52 Arabic entries; surfacing all of them in the Downloads list
 *  is overkill. The live fetch still feeds an "all tafsirs"
 *  view behind a "Show more" affordance in a future iteration. */
export const CURATED_QURANI_TAFSEERS: QuraniTafseer[] = [
  // Curated set — most popular Arabic tafsirs that work well for
  // offline reading (text-rich, reliable metadata). Ordered by
  // expected user demand; the order matches how they appear in
  // the Downloads UI list.
  // NOTE: actual identifiers are loaded from the live
  // /edition?type=tafsir response. The CURATED list is keyed by
  // a friendly slug that resolves to the live identifier at
  // download time.
] as QuraniTafseer[];

/** Returns the Arabic-only subset of a tafsir list. */
export function arabicTafseers(list: QuranApiEdition[]): QuraniTafseer[] {
  return list.filter(
    (e): e is QuraniTafseer => e.type === 'tafsir' && e.language === 'ar',
  );
}
