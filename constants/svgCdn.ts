/**
 * jsDelivr-backed GitHub mirror for quranpedia/quran-svg.
 *
 * Why jsDelivr (not raw.githubusercontent.com):
 *  - raw.githubusercontent.com is rate-limited (~60 req/hr/IP) and GitHub
 *    explicitly says it is NOT a CDN. jsDelivr mirrors any GitHub repo
 *    through 750+ PoPs worldwide, supports brotli+gzip, and has no
 *    meaningful rate limits.
 *  - See plan: docs/licenses/quran-svg-sha.txt is the source of truth for
 *    the pinned commit SHA.
 *
 * Why we pin to a SHA (not `main`):
 *  - The per-page JSON polygons are tied to the SVG layout. If the
 *    upstream repo restructures the mushaf, polygon coordinates would
 *    drift and every highlight would land on the wrong ayah. Bumping
 *    the SHA must be a deliberate, audited change.
 *
 * Override at runtime: set `EXPO_PUBLIC_QURAN_SVG_CDN` in `.env` to a
 * different base URL (e.g. a local mirror during dev). The two helpers
 * below honor the override transparently.
 */

const PINNED_SHA = '1525aa7d6e94a4c17a051302767331ef500308ec';
// 2026-06-15 — "Restructure into qiraa/publisher; add Libyan Awqaf (Qalun) mushaf"

const DEFAULT_CDN_BASE = `https://cdn.jsdelivr.net/gh/quranpedia/quran-svg@${PINNED_SHA}`;

export const QURAN_SVG_PINNED_SHA = PINNED_SHA;
export const QURAN_SVG_CDN_BASE: string =
  (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_QURAN_SVG_CDN) ||
  DEFAULT_CDN_BASE;

/** Tafaseer mirror — separate repo to avoid bloating quran-svg with our files. */
const TAFSEER_PINNED_SHA_PLACEHOLDER =
  '<set after creating adelpro/quran-tafaseer-mirror>';
const TAFSEER_CDN_BASE = `https://cdn.jsdelivr.net/gh/adelpro/quran-tafaseer-mirror@${TAFSEER_PINNED_SHA_PLACEHOLDER}`;

export const QURAN_TAFSEER_CDN_BASE: string =
  (typeof process !== 'undefined' &&
    process.env?.EXPO_PUBLIC_QURAN_TAFSEER_CDN) ||
  TAFSEER_CDN_BASE;

/**
 * The six qiraat we support. The first two are bundled in the APK; the
 * other four are downloaded on demand from the CDN above.
 */
export type Qiraa =
  | 'hafs'
  | 'warsh'
  | 'qalon-kfqc'
  | 'qalon-libya-awqaf'
  | 'douri-kfqc'
  | 'shubah-kfqc';

/** Maps our qiraa enum to the upstream repo's `<qiraa>/<publisher>` path. */
export const QIRA_TO_UPSTREAM_PATH: Record<Qiraa, string> = {
  hafs: 'hafs/kfqc',
  warsh: 'warsh/kfqc',
  'qalon-kfqc': 'qalon/kfqc',
  'qalon-libya-awqaf': 'qalon/libya-awqaf',
  'douri-kfqc': 'douri/kfqc',
  'shubah-kfqc': 'shubah/kfqc',
};

/** Human-readable Arabic label for each qiraa, used in the UI (TopMenu etc.). */
export const QIRA_ARABIC_LABEL: Record<Qiraa, string> = {
  hafs: 'حفص',
  warsh: 'ورش',
  'qalon-kfqc': 'قالون',
  'qalon-libya-awqaf': 'قالون الليبي',
  'douri-kfqc': 'الدوري',
  'shubah-kfqc': 'شعبة',
};

/** Default page count for each qiraat. Used by download progress UI. */
export const QIRA_DEFAULT_PAGE_COUNT: Record<Qiraa, number> = {
  hafs: 604,
  warsh: 604,
  'qalon-kfqc': 604,
  'qalon-libya-awqaf': 612,
  'douri-kfqc': 604,
  'shubah-kfqc': 604,
};

/** Build a URL for a single page SVG on the CDN. */
export function quranSvgPageUrl(qiraa: Qiraa, page: number): string {
  const path = QIRA_TO_UPSTREAM_PATH[qiraa];
  const padded = String(page).padStart(3, '0');
  return `${QURAN_SVG_CDN_BASE}/mushafs/${path}/svg/${padded}.svg`;
}

/** Build a URL for a single page JSON (polygon hit-regions) on the CDN. */
export function quranSvgJsonUrl(qiraa: Qiraa, page: number): string {
  const path = QIRA_TO_UPSTREAM_PATH[qiraa];
  const padded = String(page).padStart(3, '0');
  return `${QURAN_SVG_CDN_BASE}/mushafs/${path}/json/${padded}.json`;
}

/** Build a URL for a tafseer JSON on the tafseer mirror CDN. */
export function quranTafseerUrl(key: string): string {
  return `${QURAN_TAFSEER_CDN_BASE}/${key}.json`;
}

/** Qiraat that ship pre-bundled inside the APK (no download needed). */
export const BUNDLED_QIRAA: readonly Qiraa[] = ['hafs', 'warsh'];
