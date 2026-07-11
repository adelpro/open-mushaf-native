/**
 * CDN configuration + single source of truth for every tafseer the app
 * supports. Mirrors the `constants/riwayas.ts` pattern: `TAFSEERS` is
 * the canonical `as const` tuple, and every other export (the
 * `TafseerKey` literal-union type, the `TAFSEER_ARABIC_LABEL` map,
 * the canonical display-order list) is derived from it. Adding or
 * removing a tafseer = one edit in `TAFSEERS`.
 *
 * The public surface (`TafseerKey`, `TAFSEER_ARABIC_LABEL`,
 * `quranTafseerUrl`, `DEFAULT_TAFSEER`, `TAFSEER_CDN_BASE`) is
 * unchanged from the previous hand-typed version, so all existing
 * consumers keep working without import changes.
 *
 * Files hosted in the same repository as the app:
 *   https://github.com/adelpro/open-mushaf-native
 *
 * Pinned to the stable release tag `v4.0.0` to ensure immutability.
 * Override at runtime by setting `EXPO_PUBLIC_TAFSEER_CDN` in `.env`.
 */

const DEFAULT_CDN_BASE =
  'https://cdn.jsdelivr.net/gh/adelpro/open-mushaf-native@v4.0.0/assets/tafaseer';

export const TAFSEER_CDN_BASE: string =
  (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_TAFSEER_CDN) ||
  DEFAULT_CDN_BASE;

/**
 * Canonical tafseer list — order here is the display order in the
 * tafseer popup and matches what `app/(tabs)/(more)/downloads.tsx`
 * shows. Edit this tuple to add or remove a tafseer.
 */
export const TAFSEERS = [
  { id: 'baghawy', arabic: 'البغوي' },
  { id: 'earab', arabic: 'إعراب القرآن' },
  { id: 'katheer', arabic: 'تفسير ابن كثير' },
  { id: 'maany', arabic: 'معاني القرآن' },
  { id: 'muyassar', arabic: 'الميسر' },
  { id: 'nozool-wahidy', arabic: 'أسباب النزول' },
  { id: 'qortoby', arabic: 'القرطبي' },
  { id: 'saady', arabic: 'السعدي' },
  { id: 'tabary', arabic: 'الطبري' },
  { id: 'tanweer', arabic: 'تفسير التنوير' },
] as const;

export type TafseerKey = (typeof TAFSEERS)[number]['id'];
export type TafseerArabic = (typeof TAFSEERS)[number]['arabic'];

/** Human‑readable Arabic labels. */
export const TAFSEER_ARABIC_LABEL: Record<TafseerKey, string> =
  Object.fromEntries(TAFSEERS.map((t) => [t.id, t.arabic])) as Record<
    TafseerKey,
    string
  >;

/** Canonical display order (matches `TAFSEERS` insertion order). */
export const TAFSEERS_LIST: readonly TafseerKey[] = TAFSEERS.map(
  (t) => t.id,
) as readonly TafseerKey[];

/** Build a URL for a tafseer JSON file. */
export function quranTafseerUrl(key: TafseerKey): string {
  return `${TAFSEER_CDN_BASE}/${key}.json`;
}

/** Default tafseer to show when nothing is selected. */
export const DEFAULT_TAFSEER: TafseerKey = 'muyassar';
