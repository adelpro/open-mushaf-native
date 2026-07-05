/**
 * CDN configuration for tafseer JSON files.
 *
 * Files are hosted in the same repository as the app:
 *   https://github.com/adelpro/open-mushaf-native
 *
 * We use the stable release tag `v4.0.0` to ensure immutability.
 * Override at runtime by setting `EXPO_PUBLIC_TAFSEER_CDN` in `.env`.
 */

const DEFAULT_CDN_BASE =
  'https://cdn.jsdelivr.net/gh/adelpro/open-mushaf-native@v4.0.0/assets/tafaseer';

export const TAFSEER_CDN_BASE: string =
  (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_TAFSEER_CDN) ||
  DEFAULT_CDN_BASE;

/** Supported tafseer keys (matching filenames). */
export type TafseerKey =
  | 'baghawy'
  | 'earab'
  | 'katheer'
  | 'maany'
  | 'muyassar'
  | 'nozool-wahidy'
  | 'qortoby'
  | 'saady'
  | 'tabary'
  | 'tanweer';

/** Human‑readable Arabic labels. */
export const TAFSEER_ARABIC_LABEL: Record<TafseerKey, string> = {
  baghawy: 'البغوي',
  earab: 'إعراب القرآن',
  katheer: 'تفسير ابن كثير',
  maany: 'معاني القرآن',
  muyassar: 'الميسر',
  'nozool-wahidy': 'أسباب النزول',
  qortoby: 'القرطبي',
  saady: 'السعدي',
  tabary: 'الطبري',
  tanweer: 'تفسير التنوير',
};

/** Build a URL for a tafseer JSON file. */
export function quranTafseerUrl(key: TafseerKey): string {
  return `${TAFSEER_CDN_BASE}/${key}.json`;
}

/** Default tafseer to show when nothing is selected. */
export const DEFAULT_TAFSEER: TafseerKey = 'muyassar';
