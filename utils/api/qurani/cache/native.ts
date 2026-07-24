/**
 * Native disk cache for the open-mushaf app's qurani.ai narration
 * bundles. Mirrors the `utils/downloads/downloads.native.ts` shape
 * (expo-file-system v57).
 *
 * Layout (under the app's Documents directory):
 *
 *   Paths.document/open-mushaf/api/<riwaya>/bundle.json   (~2 MB; whole Quran)
 *   Paths.document/open-mushaf/api/<riwaya>/page-NNN.json (per-page verses, lazy)
 *   Paths.document/open-mushaf/editions.json             (~50 KB; global)
 *
 * The `open-mushaf/` top-level namespace keeps the on-device
 * folder structure self-documenting for anyone inspecting it
 * (Files app on iOS, adb on Android, etc.) and matches the
 * `open-mushaf-*` cache-name prefix used on web.
 *
 * Read paths are best-effort — a missing file returns `null` so
 * callers can fall back to network. Write paths are also best-effort
 * — a disk-full error doesn't propagate up (the in-memory copy still
 * serves the user this session).
 */

import { Directory, File, Paths } from 'expo-file-system';

import type { Riwaya } from '@/types';

/**
 * Namespacing root for the app's private storage. All app-private
 * files (quran bundles, tafseer, future caches) live under this
 * directory so the OS-level Documents listing is unambiguous.
 */
const APP_ROOT = 'open-mushaf';

const apiDir = (riwaya: Riwaya): Directory =>
  new Directory(Paths.document, APP_ROOT, 'api', riwaya);

const ensureApiDir = (riwaya: Riwaya): Directory => {
  const d = apiDir(riwaya);
  if (!d.exists) d.create({ intermediates: true });
  return d;
};

const pageFilename = (page: number): string =>
  `${String(page).padStart(3, '0')}.json`;

/* ────── Full riwaya bundle ────── */

/** True if the bundle JSON for `riwaya` is on disk. */
export async function isRiwayaBundleCached(riwaya: Riwaya): Promise<boolean> {
  try {
    const dir = ensureApiDir(riwaya);
    return new File(dir, 'bundle.json').info().exists;
  } catch {
    return false;
  }
}

/**
 * Read the full bundle. Returns `null` if missing; callers should
 * fall back to `getCompleteQuran` and `persistRiwayaBundle`.
 */
export async function readRiwayaBundleFromDisk(
  riwaya: Riwaya,
): Promise<string | null> {
  try {
    const dir = ensureApiDir(riwaya);
    const file = new File(dir, 'bundle.json');
    if (!file.info().exists) return null;
    return await file.text();
  } catch {
    return null;
  }
}

/**
 * Write the full bundle to disk. Returns the byte count when the
 * write succeeded, or 0 on failure.
 */
export async function persistRiwayaBundle(
  riwaya: Riwaya,
  json: string,
): Promise<number> {
  try {
    const dir = ensureApiDir(riwaya);
    const file = new File(dir, 'bundle.json');
    if (!file.info().exists) file.create();
    file.write(json);
    return json.length;
  } catch {
    return 0;
  }
}

/* ────── Per-page snapshot ────── */

export async function isPageSnapshotCached(
  riwaya: Riwaya,
  page: number,
): Promise<boolean> {
  try {
    const dir = ensureApiDir(riwaya);
    return new File(dir, pageFilename(page)).info().exists;
  } catch {
    return false;
  }
}

export async function readPageSnapshotFromDisk(
  riwaya: Riwaya,
  page: number,
): Promise<string | null> {
  try {
    const dir = ensureApiDir(riwaya);
    const file = new File(dir, pageFilename(page));
    if (!file.info().exists) return null;
    return await file.text();
  } catch {
    return null;
  }
}

export async function persistPageSnapshot(
  riwaya: Riwaya,
  page: number,
  json: string,
): Promise<number> {
  try {
    const dir = ensureApiDir(riwaya);
    const file = new File(dir, pageFilename(page));
    if (!file.info().exists) file.create();
    file.write(json);
    return json.length;
  } catch {
    return 0;
  }
}

/* ────── Bulk delete ────── */

/** Remove the entire `open-mushaf/api/<riwaya>/` directory. Idempotent. */
export async function deleteRiwaya(riwaya: Riwaya): Promise<void> {
  try {
    const dir = apiDir(riwaya);
    if (dir.exists) dir.delete();
  } catch {
    // Ignore — directory may not exist or be partially writable.
  }
}

/* ────── Storage size ────── */

/**
 * Bytes used by `open-mushaf/api/<riwaya>/`. Returns 0 if missing
 * or on error. Used by the Downloads page badge.
 */
export async function getRiwayaBundleBytes(riwaya: Riwaya): Promise<number> {
  try {
    const dir = apiDir(riwaya);
    if (!dir.exists) return 0;
    let sum = 0;
    for (const entry of dir.list()) {
      if (entry instanceof File && entry.info().exists) {
        sum += entry.info().size ?? 0;
      }
    }
    return sum;
  } catch {
    return 0;
  }
}
