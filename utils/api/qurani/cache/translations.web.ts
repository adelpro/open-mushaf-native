/**
 * Web cache for qurani.ai translation bundles. Uses the browser
 * Cache API, same pattern as `cache/web.ts`.
 *
 * Cache names:
 *   caches.open('open-mushaf-translation-<id>') → single-file cache
 *
 * Cache keys use a real https:// URL pointing at the qurani.ai
 * endpoint. The Cache API rejects synthetic schemes like
 * `open-mushaf-translation://` with `SecurityError: Request URL
 * must be either http:// or https://`, so we key on the qurani.ai
 * URL itself.
 */

import type { TranslationKey } from '@/constants/translations';

const QURANI_BASE = 'https://api.qurani.ai/gw/qh/v1';

const cacheName = (id: TranslationKey): string =>
  `open-mushaf-translation-${id}`;
const urlFor = (id: TranslationKey): string =>
  `${QURANI_BASE}/quran/${encodeURIComponent(id)}`;

async function openCache(name: string): Promise<Cache | null> {
  if (typeof caches === 'undefined') return null;
  try {
    return await caches.open(name);
  } catch {
    return null;
  }
}

export async function isTranslationCached(
  id: TranslationKey,
): Promise<boolean> {
  const cache = await openCache(cacheName(id));
  if (!cache) return false;
  const res = await cache.match(urlFor(id));
  return res !== undefined;
}

export async function readTranslationFromDisk(
  id: TranslationKey,
): Promise<string | null> {
  const cache = await openCache(cacheName(id));
  if (!cache) return null;
  const res = await cache.match(urlFor(id));
  if (!res) return null;
  return res.text();
}

export async function persistTranslation(
  id: TranslationKey,
  json: string,
): Promise<number> {
  const cache = await openCache(cacheName(id));
  if (!cache) return 0;
  await cache.put(
    new Request(urlFor(id)),
    new Response(json, { headers: { 'Content-Type': 'application/json' } }),
  );
  return json.length;
}

export async function deleteTranslation(id: TranslationKey): Promise<void> {
  if (typeof caches === 'undefined') return;
  await caches.delete(cacheName(id));
}

export async function getTranslationBytes(id: TranslationKey): Promise<number> {
  if (typeof caches === 'undefined') return 0;
  const cache = await openCache(cacheName(id));
  if (!cache) return 0;
  const res = await cache.match(urlFor(id));
  if (!res) return 0;
  const blob = await res.clone().blob();
  return blob.size;
}
