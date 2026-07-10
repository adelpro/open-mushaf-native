/**
 * Shared constants for the offline-download module: page counts,
 * pre-download size estimates, and a byte formatter. No platform code
 * here so the file is bundled into iOS, Android, and web equally.
 */

import type { TafseerKey } from '@/constants/TafseerCdn';
import type { Riwaya } from '@/types';

/** Page count per riwaya, mirrored from constants/svgCdn.ts. */
export const RIWAYA_PAGE_COUNTS: Record<Riwaya, number> = {
  hafs: 604,
  warsh: 604,
  'qalon-kfqc': 604,
  'qalon-libya-awqaf': 612,
  'douri-kfqc': 604,
  'shubah-kfqc': 604,
};

/**
 * Rough per-page SVG size. Used for the "Estimated size" line that
 * appears before a user has actually downloaded a riwaya. Real sizes
 * are measured at runtime via `getMushafRiwayaDirSizeBytes`.
 */
export const SVG_PAGE_BYTES_ESTIMATE = 12_000; // 12 KB

/** Rough pre-download size estimate per riwaya. */
export const RIWAYA_SIZE_ESTIMATE_BYTES: Record<Riwaya, number> =
  Object.fromEntries(
    Object.entries(RIWAYA_PAGE_COUNTS).map(([k, pages]) => [
      k,
      pages * SVG_PAGE_BYTES_ESTIMATE,
    ]),
  ) as Record<Riwaya, number>;

/**
 * Pre-download size estimates per tafseer. Captured from the actual
 * /assets/tafaseer/*.json file sizes in the repo (Jun 2026):
 *
 *   baghawy.json         8.1 MB
 *   earab.json           5.4 MB
 *   katheer.json        15.9 MB
 *   maany.json           0.8 MB
 *   muyassar.json        2.9 MB
 *   nozool-wahidy.json   2.1 MB
 *   qortoby.json        20.3 MB
 *   saady.json           6.6 MB
 *   tabary.json         35.9 MB
 *   tanweer.json        28.8 MB
 *
 * Real downloaded sizes are measured at runtime via
 * `getTafseerFileSizeBytes`.
 */
export const TAFSEER_SIZE_ESTIMATE_BYTES: Record<TafseerKey, number> = {
  baghawy: 8_100_000,
  earab: 5_400_000,
  katheer: 15_900_000,
  maany: 800_000,
  muyassar: 2_900_000,
  'nozool-wahidy': 2_100_000,
  qortoby: 20_300_000,
  saady: 6_600_000,
  tabary: 35_900_000,
  tanweer: 28_800_000,
};

/** Format a byte count as a human-readable Arabic-friendly string. */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} بايت`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} ك.ب`;
  const mb = kb / 1024;
  if (mb < 1024) return `${mb.toFixed(1)} م.ب`;
  const gb = mb / 1024;
  return `${gb.toFixed(2)} ج.ب`;
}
