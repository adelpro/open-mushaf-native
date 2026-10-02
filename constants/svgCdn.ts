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
 *
 * Riwaya metadata (Arabic labels, upstream paths, page counts) lives in
 * `@/constants/riwayas` — the canonical single source of truth. This
 * file only handles the CDN URL helpers.
 */

import { type Riwaya, RIWAYA_TO_UPSTREAM_PATH } from '@/constants/riwayas';

const PINNED_SHA = '1525aa7d6e94a4c17a051302767331ef500308ec';
// 2026-06-15 — "Restructure into qiraa/publisher; add Libyan Awqaf (Qalun) mushaf"

const DEFAULT_CDN_BASE = `https://cdn.jsdelivr.net/gh/quranpedia/quran-svg@${PINNED_SHA}`;

export const QURAN_SVG_PINNED_SHA = PINNED_SHA;
export const QURAN_SVG_CDN_BASE: string =
  (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_QURAN_SVG_CDN) ||
  DEFAULT_CDN_BASE;

/**
 * The six riwaya we support. The first two are bundled in the APK; the
 * other four are downloaded on demand from the CDN above.
 */

/** Build a URL for a single page SVG on the CDN. */
export function quranSvgPageUrl(qiraa: Riwaya, page: number): string {
  const path = RIWAYA_TO_UPSTREAM_PATH[qiraa];
  const padded = String(page).padStart(3, '0');
  return `${QURAN_SVG_CDN_BASE}/mushafs/${path}/svg/${padded}.svg`;
}

/** Build a URL for a single page JSON (polygon hit-regions) on the CDN. */
export function quranSvgJsonUrl(riwaya: Riwaya, page: number): string {
  const path = RIWAYA_TO_UPSTREAM_PATH[riwaya];
  const padded = String(page).padStart(3, '0');
  return `${QURAN_SVG_CDN_BASE}/mushafs/${path}/json/${padded}.json`;
}
