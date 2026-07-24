/**
 * Web disk cache for the open-mushaf app's qurani.ai narration
 * bundles. Uses the browser Cache API (same pattern as
 * `utils/downloads/downloads.web.ts`).
 *
 * Cache names (logical namespaces):
 *
 *   caches.open('open-mushaf-api-<riwaya>')      → bundle + page snapshots
 *   caches.open('open-mushaf-editions')          → global editions snapshot
 *
 * Each entry is keyed by a real https:// URL pointing at the
 * qurani.ai endpoint we fetched. The Cache API rejects synthetic
 * schemes like `open-mushaf-api://` with `SecurityError: Request
 * URL open-mushaf-api://hafs/bundle.json must be either http://
 * or https://`. Using the qurani.ai URL itself as the key means the
 * same entry is keyed by the same string a future service-worker
 * route would use.
 *
 *   https://api.qurani.ai/gw/qh/v1/quran/<edition>   (bundle)
 *   https://api.qurani.ai/gw/qh/v1/page/<n>/<edition> (per-page)
 *
 * The cache name itself still carries the `open-mushaf-` prefix
 * matching the native on-disk folder name so the two storage
 * backends are inspectable in parallel.
 *
 * Read paths are best-effort — a missing entry returns `null` so
 * callers fall back to network. Write paths are also best-effort.
 */

import { RIWAYA_TO_QURANI_EDITION } from '@/constants/quraniEditions';
import type { Riwaya } from '@/types';

const QURANI_BASE = 'https://api.qurani.ai/gw/qh/v1';

/**
 * Build the cache-name + canonical key URLs for a given riwaya.
 * The key URLs are real https endpoints pointing at qurani.ai so
 * the Cache API accepts them.
 */
function keysFor(riwaya: Riwaya): {
  cacheName: string;
  bundleUrl: string;
  pageUrl: (page: number) => string;
} {
  const edition = RIWAYA_TO_QURANI_EDITION[riwaya];
  return {
    cacheName: `open-mushaf-api-${riwaya}`,
    bundleUrl: `${QURANI_BASE}/quran/${edition}`,
    pageUrl: (page: number) => `${QURANI_BASE}/page/${page}/${edition}`,
  };
}

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

/* ────── Full riwaya bundle ────── */

export async function isRiwayaBundleCached(riwaya: Riwaya): Promise<boolean> {
  const { cacheName, bundleUrl } = keysFor(riwaya);
  const res = await matchInCache(cacheName, bundleUrl);
  return res !== undefined;
}

export async function readRiwayaBundleFromDisk(
  riwaya: Riwaya,
): Promise<string | null> {
  const { cacheName, bundleUrl } = keysFor(riwaya);
  const res = await matchInCache(cacheName, bundleUrl);
  if (!res) return null;
  return res.text();
}

export async function persistRiwayaBundle(
  riwaya: Riwaya,
  json: string,
): Promise<number> {
  const { cacheName, bundleUrl } = keysFor(riwaya);
  const cache = await openCache(cacheName);
  if (!cache) return 0;
  await cache.put(
    new Request(bundleUrl),
    new Response(json, { headers: { 'Content-Type': 'application/json' } }),
  );
  return json.length;
}

/* ────── Per-page snapshot ────── */

export async function isPageSnapshotCached(
  riwaya: Riwaya,
  page: number,
): Promise<boolean> {
  const { cacheName, pageUrl } = keysFor(riwaya);
  const res = await matchInCache(cacheName, pageUrl(page));
  return res !== undefined;
}

export async function readPageSnapshotFromDisk(
  riwaya: Riwaya,
  page: number,
): Promise<string | null> {
  const { cacheName, pageUrl } = keysFor(riwaya);
  const res = await matchInCache(cacheName, pageUrl(page));
  if (!res) return null;
  return res.text();
}

export async function persistPageSnapshot(
  riwaya: Riwaya,
  page: number,
  json: string,
): Promise<number> {
  const { cacheName, pageUrl } = keysFor(riwaya);
  const cache = await openCache(cacheName);
  if (!cache) return 0;
  await cache.put(
    new Request(pageUrl(page)),
    new Response(json, { headers: { 'Content-Type': 'application/json' } }),
  );
  return json.length;
}

/* ────── Bulk delete ────── */

export async function deleteRiwaya(riwaya: Riwaya): Promise<void> {
  if (typeof caches === 'undefined') return;
  const { cacheName } = keysFor(riwaya);
  await caches.delete(cacheName);
}

/* ────── Storage size ────── */

export async function getRiwayaBundleBytes(riwaya: Riwaya): Promise<number> {
  if (typeof caches === 'undefined') return 0;
  const { cacheName } = keysFor(riwaya);
  const cache = await openCache(cacheName);
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
