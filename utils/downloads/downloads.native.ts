/** Native offline cache, backed by the installed Expo filesystem API. */

import { Directory, File, Paths } from 'expo-file-system';

import { quranPngPageUrl } from '@/constants/pngCdn';
import { getRiwayaMetadata, RIWAYAT_LIST } from '@/constants/riwayas';
import {
  quranTafseerUrl,
  TafseerKey,
  TAFSEERS_LIST,
} from '@/constants/TafseerCdn';
import { Riwaya } from '@/types';

import { throwIfAborted } from './coordinator';
import { SVG_PAGE_BYTES_ESTIMATE } from './shared';
import { parseTafseer, utf8ByteLength, validatePng } from './validation';

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
    if (!(await isMushafPageCached(riwaya, page))) return undefined;
    return file.uri;
  } catch {
    return undefined;
  }
}

/** Native file URIs do not need explicit cleanup. */
export function releaseMushafPageUri(uri: string): void {
  // Native file URIs need no object URL cleanup.
  void uri;
}

/** Returns true if the given mushaf page is on disk. */
export async function isMushafPageCached(
  riwaya: Riwaya,
  page: number,
): Promise<boolean> {
  try {
    const dir = ensureMushafDir(riwaya);
    const file = new File(dir, pageFilename(page));
    if (!file.exists) return false;
    validatePng(await file.bytes());
    return true;
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
  const bytes = await file.bytes();
  validatePng(bytes);
  return bytes;
}

/**
 * Write a mushaf page to disk, creating the file and parent directory
 * if needed. Best-effort: returns the byte count when the write
 * succeeded, or 0 on failure so the caller can ignore persist errors
 * during read paths.
 */
export function persistMushafPage(
  riwaya: Riwaya,
  page: number,
  bytes: Uint8Array,
  signal?: AbortSignal,
): Promise<number> {
  return Promise.resolve().then(() => {
    validatePng(bytes);
    throwIfAborted(signal);
    const dir = ensureMushafDir(riwaya);
    return commitFile(dir, pageFilename(page), bytes, bytes.byteLength, signal);
  });
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
  throwIfAborted(signal);
  validatePng(bytes);
  const byteCount = await persistMushafPage(riwaya, page, bytes, signal);
  if (byteCount !== bytes.byteLength || byteCount === 0)
    throw new Error('Page persistence failed');
  throwIfAborted(signal);
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
    for (let page = 1; page <= riwayaTotalPages(riwaya); page++) {
      if (await isMushafPageCached(riwaya, page)) count++;
    }
    return count;
  } catch {
    return 0;
  }
}

/** Bytes used on disk by this riwaya's directory. */
export function getMushafRiwayaDirSizeBytes(riwaya: Riwaya): Promise<number> {
  return Promise.resolve().then(() => {
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
  });
}

/** Remove a riwaya's cache directory from disk. */
export function deleteMushafRiwaya(riwaya: Riwaya): Promise<void> {
  return Promise.resolve().then(() => {
    const dir = mushafDir(riwaya);
    if (dir.exists) dir.delete();
  });
}

/** Returns an upper-bound estimate of the downloaded pages, used for
 *  "are we done?" checks before kicking off a download. */
export function riwayaTotalPages(riwaya: Riwaya): number {
  return getRiwayaMetadata(riwaya).pages;
}

/** Upper-bound estimate of bytes a full riwaya will occupy on disk. */
export function riwayaEstimatedBytes(riwaya: Riwaya): number {
  return getRiwayaMetadata(riwaya).pages * SVG_PAGE_BYTES_ESTIMATE;
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
    return (await readTafseerFromDisk(key)) !== null;
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
    const text = await file.text();
    parseTafseer(text, key);
    return text;
  } catch {
    return null;
  }
}

export function persistTafseer(
  key: TafseerKey,
  json: string,
  signal?: AbortSignal,
): Promise<number> {
  return Promise.resolve().then(() => {
    parseTafseer(json, key);
    throwIfAborted(signal);
    return commitFile(
      ensureTafseerDir(),
      tafseerFilename(key),
      json,
      utf8ByteLength(json),
      signal,
    );
  });
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
  throwIfAborted(signal);
  parseTafseer(text, key);
  const bytes = await persistTafseer(key, text, signal);
  if (bytes !== utf8ByteLength(text) || bytes === 0)
    throw new Error('Tafseer persistence failed');
  throwIfAborted(signal);
  return { bytes };
}

export function getTafseerFileSizeBytes(key: TafseerKey): Promise<number> {
  return Promise.resolve().then(() => {
    try {
      const dir = ensureTafseerDir();
      const file = new File(dir, tafseerFilename(key));
      if (!file.info().exists) return 0;
      return file.info().size ?? 0;
    } catch {
      return 0;
    }
  });
}

export function deleteTafseer(key: TafseerKey): Promise<void> {
  return Promise.resolve().then(() => {
    const file = new File(tafseerDir(), tafseerFilename(key));
    if (file.exists) file.delete();
  });
}

/* ---------------- Aggregated storage snapshot ---------------- */

const TAFSEER_KEYS = TAFSEERS_LIST;

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
  const riwayaEntries = await Promise.all(
    RIWAYAS.map(
      async (riwaya) =>
        [riwaya, await getMushafRiwayaDirSizeBytes(riwaya)] as const,
    ),
  );
  const tafseerEntries = await Promise.all(
    TAFSEER_KEYS.map(
      async (key) => [key, await getTafseerFileSizeBytes(key)] as const,
    ),
  );
  const totalBytes = [...riwayaEntries, ...tafseerEntries].reduce(
    (sum, [, bytes]) => sum + bytes,
    0,
  );
  return {
    totalBytes,
    byRiwaya: Object.fromEntries(riwayaEntries),
    byTafseer: Object.fromEntries(tafseerEntries),
  };
}

/** Write a sibling staging file, verify it, then expose the final filename. */
let stagingId = 0;
function commitFile(
  dir: Directory,
  name: string,
  data: string | Uint8Array,
  expected: number,
  signal?: AbortSignal,
): number {
  const staging = new File(
    dir,
    name + '.' + Date.now() + '.' + ++stagingId + '.part',
  );
  const destination = new File(dir, name);
  const backup = new File(
    dir,
    name + '.' + Date.now() + '.' + stagingId + '.bak',
  );
  let finalWritten = false;
  try {
    staging.create();
    staging.write(data);
    if (staging.size !== expected) throw new Error('Incomplete file write');
    if (typeof data === 'string') parseTafseer(staging.textSync());
    else validatePng(staging.bytesSync());
    throwIfAborted(signal);
    // Keep the previous file recoverable until the replacement commits.
    if (destination.exists) new File(dir, name).move(backup);
    staging.move(destination);
    finalWritten = true;
    if (!destination.exists || destination.size !== expected)
      throw new Error('File commit failed');
    return expected;
  } catch (error) {
    removeFailedCommit(destination, finalWritten);
    finalWritten = false;
    restoreBackup(destination, backup);
    throw error;
  } finally {
    cleanupCommitFiles(staging, backup, finalWritten);
  }
}

function cleanupCommitFiles(
  staging: File,
  backup: File,
  finalWritten: boolean,
) {
  // move() updates the staging handle URI to the destination. Cleanup must
  // not turn a verified commit into a failed operation.
  try {
    if (staging.uri.endsWith('.part') && staging.exists) staging.delete();
  } catch {
    /* Retained staging files are never counted as downloaded. */
  }
  try {
    if (finalWritten && backup.exists) backup.delete();
  } catch {
    /* Harmless backup; excluded from completion checks. */
  }
}

function removeFailedCommit(destination: File, finalWritten: boolean) {
  if (finalWritten && destination.exists) destination.delete();
}

function restoreBackup(destination: File, backup: File) {
  if (backup.exists && !destination.exists) backup.move(destination);
}
