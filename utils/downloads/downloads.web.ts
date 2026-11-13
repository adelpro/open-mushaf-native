/**
 * Web implementation of the offline-download module backed by the
 * browser Cache API + `navigator.storage.estimate()`. Metro picks
 * this file on web (`utils/downloads/downloads.web.ts`); native
 * builds use `utils/downloads/downloads.native.ts` (expo-file-system).
 *
 * The on-disk layout for native becomes a logical cache namespace
 * for web:
 *
 *   Per-riwaya PNG:  `caches.open('mushaf-download-<riwaya>')`
 *   Per-tafseer JSON: `caches.open('tafseer-download-<key>')`
 *
 * Cache entries are keyed by full CDN URL. Explicit download caches and
 * Workbox runtime caches are separate namespaces and can contain duplicate bodies.
 *
 * **Web "is downloaded" tracking.** The MMKV-backed
 * `downloadedRiwayat` / `downloadedTafseers` atoms persist on web
 * too (they use `localStorage` via `createStorage.web.ts`), so
 * tracking happens at the atom layer — `isMushafPageCached()` here
 * reflects *what's in the Cache API*, not the atom. The Downloads
 * page reads the atoms for UI badges; the actual data lives in
 * the Cache API.
 */

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

// All cache names live in one object so the service-worker cleanup
// allowlist (see `public/service-worker.js`) and this file can
// stay in lockstep.
const CACHE_NAMES = {
  mushafPack: (riwaya: Riwaya) => `mushaf-download-${riwaya}`,
  tafseer: (key: TafseerKey) => `tafseer-download-${key}`,
};

/* ────── low-level cache helpers ────── */

async function openCache(name: string): Promise<Cache | null> {
  if (typeof caches === 'undefined') return null;
  try {
    return await caches.open(name);
  } catch {
    return null;
  }
}

async function matchInCache(
  cacheName: string,
  url: string,
): Promise<Response | undefined> {
  const cache = await openCache(cacheName);
  if (!cache) return undefined;
  try {
    return await cache.match(url);
  } catch {
    return undefined;
  }
}

/** Create a displayable object URL for a page stored in the Cache API. */
export async function getMushafPageUri(
  riwaya: Riwaya,
  page: number,
): Promise<string | undefined> {
  const url = quranPngPageUrl(riwaya, page);
  const response = await matchInCache(CACHE_NAMES.mushafPack(riwaya), url);
  if (
    !response ||
    typeof URL === 'undefined' ||
    typeof URL.createObjectURL !== 'function'
  ) {
    return undefined;
  }
  try {
    const bytes = new Uint8Array(await response.arrayBuffer());
    validatePng(bytes);
    return URL.createObjectURL(
      new Blob([bytes.buffer as ArrayBuffer], { type: 'image/png' }),
    );
  } catch {
    return undefined;
  }
}

/** Release an object URL created for a cached page. */
export function releaseMushafPageUri(uri: string): void {
  if (typeof URL !== 'undefined' && typeof URL.revokeObjectURL === 'function') {
    URL.revokeObjectURL(uri);
  }
}

/* ────── mushaf (riwaya) page cache ────── */

export async function isMushafPageCached(
  riwaya: Riwaya,
  page: number,
): Promise<boolean> {
  const url = quranPngPageUrl(riwaya, page);
  const cacheName = CACHE_NAMES.mushafPack(riwaya);
  const res = await matchInCache(cacheName, url);
  if (!res) return false;
  try {
    validatePng(new Uint8Array(await res.arrayBuffer()));
    return true;
  } catch {
    return false;
  }
}

export async function readMushafPageFromDisk(
  riwaya: Riwaya,
  page: number,
): Promise<Uint8Array> {
  const url = quranPngPageUrl(riwaya, page);
  const res = await matchInCache(CACHE_NAMES.mushafPack(riwaya), url);
  if (!res) throw new Error(`Cache miss for ${url}`);
  const bytes = new Uint8Array(await res.arrayBuffer());
  validatePng(bytes);
  return bytes;
}

export async function persistMushafPage(
  riwaya: Riwaya,
  page: number,
  bytes: Uint8Array,
  signal?: AbortSignal,
): Promise<number> {
  validatePng(bytes);
  throwIfAborted(signal);
  const url = quranPngPageUrl(riwaya, page);
  const cache = await openCache(CACHE_NAMES.mushafPack(riwaya));
  if (!cache) throw new Error('Cache storage unavailable');
  throwIfAborted(signal);
  // Putting as a synthesized Response clones the body — same data
  // shared with the Service Worker route caches.
  let committed = false;
  try {
    await cache.put(
      new Request(url),
      new Response(bytes.slice().buffer as ArrayBuffer, {
        headers: { 'Content-Type': 'image/png' },
      }),
    );
    committed = true;
    if (signal?.aborted) {
      await cache.delete(url);
      throwIfAborted(signal);
    }
    const saved = await cache.match(url);
    if (!saved) throw new Error('Page cache commit failed');
    const persisted = new Uint8Array(await saved.arrayBuffer());
    validatePng(persisted);
    if (
      persisted.length !== bytes.length ||
      !persisted.every((value, i) => value === bytes[i])
    )
      throw new Error('Page cache verification failed');
    throwIfAborted(signal);
    return bytes.byteLength;
  } catch (error) {
    if (committed) await cache.delete(url);
    throw error;
  }
}

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
  // Clone the response body so we can write it to our cache without
  // consuming the original stream.
  const bytes = new Uint8Array(await res.arrayBuffer());
  throwIfAborted(signal);
  validatePng(bytes);
  const byteCount = await persistMushafPage(riwaya, page, bytes, signal);
  if (byteCount !== bytes.byteLength || byteCount === 0)
    throw new Error('Page persistence failed');
  throwIfAborted(signal);
  return { bytes: byteCount };
}

export async function getMushafRiwayaDownloadedPages(
  riwaya: Riwaya,
): Promise<number> {
  // The Cache API doesn't expose a count helper; iterate keys.
  const cache = await openCache(CACHE_NAMES.mushafPack(riwaya));
  if (!cache) return 0;
  let count = 0;
  for (let page = 1; page <= riwayaTotalPages(riwaya); page++) {
    if (await isMushafPageCached(riwaya, page)) count++;
  }
  return count;
}

export async function getMushafRiwayaDirSizeBytes(
  riwaya: Riwaya,
): Promise<number> {
  const cache = await openCache(CACHE_NAMES.mushafPack(riwaya));
  if (!cache) return 0;
  const requests = await cache.keys();
  let total = 0;
  for (const req of requests) {
    const res = await cache.match(req);
    if (!res) continue;
    const blob = await res.clone().blob();
    total += blob.size;
  }
  return total;
}

export async function deleteMushafRiwaya(riwaya: Riwaya): Promise<void> {
  if (typeof caches === 'undefined') return;
  await caches.delete(CACHE_NAMES.mushafPack(riwaya));
}

export function riwayaTotalPages(riwaya: Riwaya): number {
  return getRiwayaMetadata(riwaya).pages;
}

export const riwayaEstimatedBytes = (riwaya: Riwaya): number =>
  getRiwayaMetadata(riwaya).pages * SVG_PAGE_BYTES_ESTIMATE;

/* ────── tafseer cache ────── */

export async function isTafseerCached(key: TafseerKey): Promise<boolean> {
  return (await readTafseerFromDisk(key)) !== null;
}

export async function readTafseerFromDisk(
  key: TafseerKey,
): Promise<string | null> {
  const res = await matchInCache(
    CACHE_NAMES.tafseer(key),
    quranTafseerUrl(key),
  );
  if (!res) return null;
  try {
    const text = await res.text();
    parseTafseer(text, key);
    return text;
  } catch {
    return null;
  }
}

export async function persistTafseer(
  key: TafseerKey,
  json: string,
  signal?: AbortSignal,
): Promise<number> {
  parseTafseer(json, key);
  throwIfAborted(signal);
  const cache = await openCache(CACHE_NAMES.tafseer(key));
  if (!cache) throw new Error('Cache storage unavailable');
  throwIfAborted(signal);
  let committed = false;
  try {
    await cache.put(
      new Request(quranTafseerUrl(key)),
      new Response(json, {
        headers: { 'Content-Type': 'application/json' },
      }),
    );
    committed = true;
    if (signal?.aborted) {
      await cache.delete(quranTafseerUrl(key));
      throwIfAborted(signal);
    }
    const saved = await cache.match(quranTafseerUrl(key));
    if (!saved || (await saved.text()) !== json)
      throw new Error('Tafseer cache commit failed');
    throwIfAborted(signal);
    return utf8ByteLength(json);
  } catch (error) {
    if (committed) await cache.delete(quranTafseerUrl(key));
    throw error;
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
  throwIfAborted(signal);
  parseTafseer(text, key);
  const bytes = await persistTafseer(key, text, signal);
  if (bytes !== utf8ByteLength(text) || bytes === 0)
    throw new Error('Tafseer persistence failed');
  throwIfAborted(signal);
  return { bytes };
}

export async function getTafseerFileSizeBytes(
  key: TafseerKey,
): Promise<number> {
  const cache = await openCache(CACHE_NAMES.tafseer(key));
  if (!cache) return 0;
  const res = await cache.match(quranTafseerUrl(key));
  if (!res) return 0;
  const blob = await res.clone().blob();
  return blob.size;
}

export async function deleteTafseer(key: TafseerKey): Promise<void> {
  if (typeof caches === 'undefined') return;
  await caches.delete(CACHE_NAMES.tafseer(key));
}

/* ────── aggregated storage snapshot ────── */

const RIWAYAS: readonly Riwaya[] = RIWAYAT_LIST;

const TAFSEER_KEYS = TAFSEERS_LIST;

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
