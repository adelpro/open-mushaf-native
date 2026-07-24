/**
 * Native implementation of the open-mushaf app's offline-download
 * module backed by `expo-file-system` v57. iOS/Android only — the web
 * variant ships in `downloads.web.ts`. Metro picks this file by
 * default on native.
 *
 * Per Phase 0 of the qurani.ai integration plan, the mushaf-SVG
 * download path is removed. Narration text bundles and per-page
 * snapshots are persisted by `utils/api/qurani/cache/native.ts`,
 * which the Downloads page consumes via the `@/utils/downloads`
 * barrel re-exports.
 *
 * Storage layout (under the app's Documents directory):
 *
 *   Paths.document/open-mushaf/api/<riwaya>/...    ← qurani.ai cache
 *   Paths.document/open-mushaf/tafseer/<key>.json ← tafseer cache
 *
 * The `open-mushaf/` top-level prefix is the app's private-data
 * namespace — matches the `open-mushaf-*` cache-name prefix used
 * on web so both storage backends are inspectable in parallel.
 */

import { Directory, File, Paths } from 'expo-file-system';

import { quranTafseerUrl, TafseerKey } from '@/constants/TafseerCdn';
import { TRANSLATIONS_LIST } from '@/constants/translations';
import { Riwaya } from '@/types';
import {
  getRiwayaBundleBytes,
  getTranslationBytes,
} from '@/utils/api/qurani/cache';

/** App-private storage root. Matches the web cache-name prefix. */
const APP_ROOT = 'open-mushaf';

/* ---------------- Tafseer cache ---------------- */

function tafseerDir(): Directory {
  return new Directory(Paths.document, APP_ROOT, 'tafseer');
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
    const dir = tafseerDir();
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
