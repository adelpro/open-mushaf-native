/**
 * Web implementation of the offline-download module backed by the
 * browser Cache API + `navigator.storage.estimate()`. Metro picks
 * this file on web (`utils/downloads/downloads.web.ts`); native
 * builds use `utils/downloads/downloads.native.ts` (expo-file-system).
 *
 * The on-disk layout for native becomes a logical cache namespace
 * for web:
 *
 *   Per-riwaya SVG:  `caches.open('mushaf-download-<riwaya>')`
 *   Per-tafseer JSON: `caches.open('tafseer-download-<key>')`
 *
 * Each entry is keyed by the full CDN URL so the same cache entry
 * can also be requested by the `mushaf-svgs` and `tafseer-data`
 * service-worker routes (they overlap intentionally so the SW cache
 * + our explicit cache share one body per URL — disk budget is
 * cheaper this way).
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
import { RIWAYAT_LIST } from '@/constants/riwayas';
import { quranTafseerUrl, TafseerKey } from '@/constants/TafseerCdn';
import { Riwaya } from '@/types';

import { RIWAYA_PAGE_COUNTS, SVG_PAGE_BYTES_ESTIMATE } from './shared';

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
  return cache.match(url);
}

/** Create a displayable object URL for a page stored in the Cache API. */
export async function getMushafPageUri(
  riwaya: Riwaya,
  page: number,
): Promise<string | undefined> {
  const url = quranPngPageUrl(riwaya, page);
  const response = await matchInCache(CACHE_NAMES.mushafPack(riwaya), url);
  if (!response || typeof URL === 'undefined' || !URL.createObjectURL) {
    return undefined;
  }
  return URL.createObjectURL(await response.blob());
}

/** Release an object URL created for a cached page. */
export function releaseMushafPageUri(uri: string): void {
  if (typeof URL !== 'undefined' && URL.revokeObjectURL) {
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
  return res !== undefined;
}

export async function readMushafPageFromDisk(
  riwaya: Riwaya,
  page: number,
): Promise<Uint8Array> {
  const url = quranPngPageUrl(riwaya, page);
  const res = await matchInCache(CACHE_NAMES.mushafPack(riwaya), url);
  if (!res) throw new Error(`Cache miss for ${url}`);
  return new Uint8Array(await res.arrayBuffer());
}

export async function persistMushafPage(
  riwaya: Riwaya,
  page: number,
  bytes: Uint8Array,
): Promise<number> {
  const url = quranPngPageUrl(riwaya, page);
  const cache = await openCache(CACHE_NAMES.mushafPack(riwaya));
  if (!cache) return 0;
  // Putting as a synthesized Response clones the body — same data
  // shared with the Service Worker route caches.
  await cache.put(
    new Request(url),
    new Response(bytes.buffer as ArrayBuffer, {
      headers: { 'Content-Type': 'image/png' },
    }),
  );
  return bytes.byteLength;
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
  const byteCount = await persistMushafPage(riwaya, page, bytes);
  return { bytes: byteCount };
}

export async function getMushafRiwayaDownloadedPages(
  riwaya: Riwaya,
): Promise<number> {
  // The Cache API doesn't expose a count helper; iterate keys.
  const cache = await openCache(CACHE_NAMES.mushafPack(riwaya));
  if (!cache) return 0;
  const requests = await cache.keys();
  return requests.length;
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
  return RIWAYA_PAGE_COUNTS[riwaya];
}

export const riwayaEstimatedBytes = (riwaya: Riwaya): number =>
  RIWAYA_PAGE_COUNTS[riwaya] * SVG_PAGE_BYTES_ESTIMATE;

/* ────── tafseer cache ────── */

export async function isTafseerCached(key: TafseerKey): Promise<boolean> {
  const cache = await openCache(CACHE_NAMES.tafseer(key));
  if (!cache) return false;
  const res = await cache.match(quranTafseerUrl(key));
  return res !== undefined;
}

export async function readTafseerFromDisk(
  key: TafseerKey,
): Promise<string | null> {
  const cache = await openCache(CACHE_NAMES.tafseer(key));
  if (!cache) return null;
  const res = await cache.match(quranTafseerUrl(key));
  if (!res) return null;
  return res.text();
}

export async function persistTafseer(
  key: TafseerKey,
  json: string,
): Promise<number> {
  const cache = await openCache(CACHE_NAMES.tafseer(key));
  if (!cache) return 0;
  await cache.put(
    new Request(quranTafseerUrl(key)),
    new Response(json, {
      headers: { 'Content-Type': 'application/json' },
    }),
  );
  return json.length;
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

export async function getStorageSnapshot(): Promise<{
  totalBytes: number;
  byRiwaya: Partial<Record<Riwaya, number>>;
  byTafseer: Partial<Record<TafseerKey, number>>;
}> {
  const byRiwaya: Partial<Record<Riwaya, number>> = {};
  let total = 0;
  for (const r of RIWAYAS) {
    const bytes = await getMushafRiwayaDirSizeBytes(r);
    byRiwaya[r] = bytes;
    total += bytes;
  }
  const byTafseer: Partial<Record<TafseerKey, number>> = {};
  for (const k of TAFSEER_KEYS) {
    const bytes = await getTafseerFileSizeBytes(k);
    byTafseer[k] = bytes;
    total += bytes;
  }
  return { totalBytes: total, byRiwaya, byTafseer };
}
