/**
 * Web implementation of the open-mushaf app's offline-download module
 * backed by the browser Cache API + `navigator.storage.estimate()`.
 * Metro picks this file on web (`utils/downloads/downloads.web.ts`);
 * native builds use `utils/downloads/downloads.native.ts`
 * (expo-file-system).
 *
 * Per Phase 0 of the qurani.ai integration plan, the mushaf-SVG
 * download path is removed. Narration text bundles and per-page
 * snapshots are persisted by `utils/api/qurani/cache/web.ts`,
 * which the Downloads page consumes via the `@/utils/downloads`
 * barrel re-exports.
 *
 * Cache namespaces:
 *
 *   caches.open('open-mushaf-tafseer-<key>')        ← tafseer cache
 *   caches.open('open-mushaf-api-<riwaya>')       ← qurani.ai cache
 *
 * The `open-mushaf-` prefix matches the on-disk folder name on
 * native so the two storage backends can be reasoned about
 * side-by-side.
 */

import { quranTafseerUrl, TafseerKey } from '@/constants/TafseerCdn';
import { TRANSLATIONS_LIST } from '@/constants/translations';
import { Riwaya } from '@/types';
import {
  getRiwayaBundleBytes,
  getTranslationBytes,
} from '@/utils/api/qurani/cache';

const CACHE_NAMES = {
  tafseer: (key: TafseerKey) => `open-mushaf-tafseer-${key}`,
} as const;

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

/* ────── tafseer cache ────── */

export async function isTafseerCached(key: TafseerKey): Promise<boolean> {
  const cacheName = CACHE_NAMES.tafseer(key);
  const res = await matchInCache(cacheName, quranTafseerUrl(key));
  return res !== undefined;
}

export async function readTafseerFromDisk(
  key: TafseerKey,
): Promise<string | null> {
  const cacheName = CACHE_NAMES.tafseer(key);
  const res = await matchInCache(cacheName, quranTafseerUrl(key));
  if (!res) return null;
  return res.text();
}

export async function persistTafseer(
  key: TafseerKey,
  json: string,
): Promise<number> {
  const cacheName = CACHE_NAMES.tafseer(key);
  const cache = await openCache(cacheName);
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
  const cacheName = CACHE_NAMES.tafseer(key);
  const res = await matchInCache(cacheName, quranTafseerUrl(key));
  if (!res) return 0;
  const blob = await res.clone().blob();
  return blob.size;
}

export async function deleteTafseer(key: TafseerKey): Promise<void> {
  if (typeof caches === 'undefined') return;
  await caches.delete(CACHE_NAMES.tafseer(key));
}

/* ────── aggregated storage snapshot ────── */

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

/**
 * Recompute per-resource and grand-total bytes used on disk by the
 * Downloads feature. Cheap enough to call from the settings page on
 * every focus, but only updates after the active downloads idle out.
 *
 * `byRiwaya` is keyed by the app `Riwaya` literal so the Downloads
 * page can look up bytes by the row it renders.
 */
export async function getStorageSnapshot(): Promise<{
  totalBytes: number;
  byRiwaya: Record<string, number>;
  byTafseer: Partial<Record<TafseerKey, number>>;
  byTranslation: Record<string, number>;
}> {
  const byTafseer: Partial<Record<TafseerKey, number>> = {};
  let total = 0;
  for (const key of TAFSEER_KEYS) {
    const bytes = await getTafseerFileSizeBytes(key);
    byTafseer[key] = bytes;
    total += bytes;
  }
  const byRiwaya: Record<string, number> = {};
  const NARRATIONS: Riwaya[] = [
    'hafs',
    'warsh',
    'qalon-kfqc',
    'douri-kfqc',
    'shubah-kfqc',
  ];
  for (const riwaya of NARRATIONS) {
    const bytes = await getRiwayaBundleBytes(riwaya);
    byRiwaya[riwaya] = bytes;
    total += bytes;
  }
  const byTranslation: Record<string, number> = {};
  for (const id of TRANSLATIONS_LIST) {
    const bytes = await getTranslationBytes(id);
    byTranslation[id] = bytes;
    total += bytes;
  }
  return { totalBytes: total, byRiwaya, byTafseer, byTranslation };
}
