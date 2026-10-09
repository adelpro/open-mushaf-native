/**
 * Native implementation of the offline-download module backed by
 * `expo-file-system` v57. iOS/Android only — the web variant ships in
 * Phase 5 as `downloads.web.ts`. Metro picks this file by default on
 * native; until Phase 5, importing on web will fail at runtime (the
 * downloads UI is gated to native for now).
 */

import { Directory, File, Paths } from 'expo-file-system';

import { quranPngPageUrl } from '@/constants/pngCdn';
import { RIWAYAT_LIST } from '@/constants/riwayas';
import { quranTafseerUrl, TafseerKey } from '@/constants/TafseerCdn';
import { Riwaya } from '@/types';

import { RIWAYA_PAGE_COUNTS, RIWAYA_SIZE_ESTIMATE_BYTES } from './shared';

/* ---------------- Mushaf (riwaya) page cache ---------------- */

/** Build a Directory handle for `<Paths.document>/mushaf/<riwaya>`. */
function mushafDir(riwaya: Riwaya): Directory {
  return new Directory(Paths.document, 'mushaf', riwaya);
}

/** Lazily create the per-riwaya directory and return it. */
function ensureMushafDir(riwaya: Riwaya): Directory {
  const dir = mushafDir(riwaya);
  if (!dir.exists) dir.create({ intermediates: true });
  return dir;
}

/** Build the on-disk filename for a given page. */
function pageFilename(page: number): string {
  return `${page}.png`;
}

/** Return the local file URI when a downloaded page is available. */
export async function getMushafPageUri(
  riwaya: Riwaya,
  page: number,
): Promise<string | undefined> {
  try {
    const dir = mushafDir(riwaya);
    const file = new File(dir, pageFilename(page));
    return file.info().exists ? file.uri : undefined;
  } catch {
    return undefined;
  }
}

/** Native file URIs do not need explicit cleanup. */
export function releaseMushafPageUri(_uri: string): void {}

/** Returns true if the given mushaf page is on disk. */
export async function isMushafPageCached(
  riwaya: Riwaya,
  page: number,
): Promise<boolean> {
  try {
    const dir = ensureMushafDir(riwaya);
    const file = new File(dir, pageFilename(page));
    return file.info().exists;
  } catch {
    return false;
  }
}

/**
 * Read a single mushaf page from disk. Throws if the file is missing;
 * callers should check with `isMushafPageCached` first.
 */
export async function readMushafPageFromDisk(
  riwaya: Riwaya,
  page: number,
): Promise<Uint8Array> {
  const dir = ensureMushafDir(riwaya);
  const file = new File(dir, pageFilename(page));
  return file.bytes();
}

/**
 * Write a mushaf page to disk, creating the file and parent directory
 * if needed. Best-effort: returns the byte count when the write
 * succeeded, or 0 on failure so the caller can ignore persist errors
 * during read paths.
 */
export async function persistMushafPage(
  riwaya: Riwaya,
  page: number,
  bytes: Uint8Array,
): Promise<number> {
  try {
    const dir = ensureMushafDir(riwaya);
    const file = new File(dir, pageFilename(page));
    if (!file.info().exists) file.create();
    file.write(bytes);
    return bytes.byteLength;
  } catch {
    return 0;
  }
}

/** Fetch one PNG page from the CDN and write it to disk. */
export async function downloadMushafPage(
  riwaya: Riwaya,
  page: number,
  signal?: AbortSignal,
): Promise<{ bytes: number }> {
  const url = quranPngPageUrl(riwaya, page);
  const res = await fetch(url, signal ? { signal } : undefined);
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} fetching ${url}`);
  }
  const bytes = new Uint8Array(await res.arrayBuffer());
  const byteCount = await persistMushafPage(riwaya, page, bytes);
  return { bytes: byteCount };
}

/** Number of pages currently downloaded for this riwaya (count of files). */
export async function getMushafRiwayaDownloadedPages(
  riwaya: Riwaya,
): Promise<number> {
  try {
    const dir = mushafDir(riwaya);
    if (!dir.exists) return 0;
    let count = 0;
    for (const entry of dir.list()) {
      const isFile = !(entry instanceof Directory);
      if (isFile) count++;
    }
    return count;
  } catch {
    return 0;
  }
}

/** Bytes used on disk by this riwaya's directory. */
export async function getMushafRiwayaDirSizeBytes(
  riwaya: Riwaya,
): Promise<number> {
  try {
    const dir = mushafDir(riwaya);
    if (!dir.exists) return 0;
    let sum = 0;
    for (const entry of dir.list()) {
      const isFile = !(entry instanceof Directory);
      if (isFile && entry.info().exists) {
        sum += entry.info().size ?? 0;
      }
    }
    return sum;
  } catch {
    return 0;
  }
}

/** Remove a riwaya's cache directory from disk. */
export async function deleteMushafRiwaya(riwaya: Riwaya): Promise<void> {
  try {
    const dir = mushafDir(riwaya);
    if (dir.exists) dir.delete();
  } catch {
    // Ignore: directory may not exist or be partially writable.
  }
}

/** Returns an upper-bound estimate of the downloaded pages, used for
 *  "are we done?" checks before kicking off a download. */
export function riwayaTotalPages(riwaya: Riwaya): number {
  return RIWAYA_PAGE_COUNTS[riwaya];
}

/** Upper-bound estimate of bytes a full riwaya will occupy on disk. */
export function riwayaEstimatedBytes(riwaya: Riwaya): number {
  return RIWAYA_SIZE_ESTIMATE_BYTES[riwaya];
}

/* ---------------- Tafseer cache ---------------- */

function tafseerDir(): Directory {
  return new Directory(Paths.document, 'tafseer');
}

function ensureTafseerDir(): Directory {
  const dir = tafseerDir();
  if (!dir.exists) dir.create({ intermediates: true });
  return dir;
}

function tafseerFilename(key: TafseerKey): string {
  return `${key}.json`;
}

export async function isTafseerCached(key: TafseerKey): Promise<boolean> {
  try {
    const dir = ensureTafseerDir();
    return new File(dir, tafseerFilename(key)).info().exists;
  } catch {
    return false;
  }
}

export async function readTafseerFromDisk(
  key: TafseerKey,
): Promise<string | null> {
  try {
    const dir = ensureTafseerDir();
    const file = new File(dir, tafseerFilename(key));
    if (!file.info().exists) return null;
    return await file.text();
  } catch {
    return null;
  }
}

export async function persistTafseer(
  key: TafseerKey,
  json: string,
): Promise<number> {
  try {
    const dir = ensureTafseerDir();
    const file = new File(dir, tafseerFilename(key));
    if (!file.info().exists) file.create();
    file.write(json);
    return json.length;
  } catch {
    return 0;
  }
}

export async function downloadTafseer(
  key: TafseerKey,
  signal?: AbortSignal,
): Promise<{ bytes: number }> {
  const url = quranTafseerUrl(key);
  const res = await fetch(url, signal ? { signal } : undefined);
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} fetching ${url}`);
  }
  const text = await res.text();
  const bytes = await persistTafseer(key, text);
  return { bytes };
}

export async function getTafseerFileSizeBytes(
  key: TafseerKey,
): Promise<number> {
  try {
    const dir = ensureTafseerDir();
    const file = new File(dir, tafseerFilename(key));
    if (!file.info().exists) return 0;
    return file.info().size ?? 0;
  } catch {
    return 0;
  }
}

export async function deleteTafseer(key: TafseerKey): Promise<void> {
  try {
    const dir = ensureTafseerDir();
    const file = new File(dir, tafseerFilename(key));
    if (file.info().exists) file.delete();
  } catch {
    // Ignore.
  }
}

/* ---------------- Aggregated storage snapshot ---------------- */

const TAFSEER_KEYS: TafseerKey[] = [
  'baghawy',
  'earab',
  'katheer',
  'maany',
  'muyassar',
  'nozool-wahidy',
  'qortoby',
  'saady',
  'tabary',
  'tanweer',
];

const RIWAYAS: readonly Riwaya[] = RIWAYAT_LIST;

/**
 * Recompute per-resource and grand-total bytes used on disk by the
 * Downloads feature. Cheap enough to call from the settings page on
 * every focus, but only updates after the active downloads idle out.
 */
export async function getStorageSnapshot(): Promise<{
  totalBytes: number;
  byRiwaya: Partial<Record<Riwaya, number>>;
  byTafseer: Partial<Record<TafseerKey, number>>;
}> {
  const byRiwaya: Partial<Record<Riwaya, number>> = {};
  let total = 0;
  for (const riwaya of RIWAYAS) {
    const bytes = await getMushafRiwayaDirSizeBytes(riwaya);
    byRiwaya[riwaya] = bytes;
    total += bytes;
  }
  const byTafseer: Partial<Record<TafseerKey, number>> = {};
  for (const key of TAFSEER_KEYS) {
    const bytes = await getTafseerFileSizeBytes(key);
    byTafseer[key] = bytes;
    total += bytes;
  }
  return { totalBytes: total, byRiwaya, byTafseer };
}
