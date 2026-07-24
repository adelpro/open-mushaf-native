/**
 * Native disk cache for qurani.ai translation bundles.
 *
 * Layout (under the app's Documents directory):
 *
 *   Paths.document/open-mushaf/translation/<translation-id>.json
 *
 * Each file is the full `/quran/<translation-id>` response (~2-3 MB
 * flat array of 6236 verses in the requested language). Lookup uses
 * the qurani.ai gid as the canonical key — same shape as
 * `QuranApiText` but with the foreign-language text instead of
 * Uthmani Arabic.
 */

import { Directory, File, Paths } from 'expo-file-system';

import type { TranslationKey } from '@/constants/translations';

const APP_ROOT = 'open-mushaf';

function translationsDir(): Directory {
  return new Directory(Paths.document, APP_ROOT, 'translation');
}

function ensureTranslationsDir(): Directory {
  const dir = translationsDir();
  if (!dir.exists) dir.create({ intermediates: true });
  return dir;
}

export async function isTranslationCached(
  id: TranslationKey,
): Promise<boolean> {
  try {
    const dir = ensureTranslationsDir();
    return new File(dir, `${id}.json`).info().exists;
  } catch {
    return false;
  }
}

export async function readTranslationFromDisk(
  id: TranslationKey,
): Promise<string | null> {
  try {
    const dir = ensureTranslationsDir();
    const file = new File(dir, `${id}.json`);
    if (!file.info().exists) return null;
    return await file.text();
  } catch {
    return null;
  }
}

export async function persistTranslation(
  id: TranslationKey,
  json: string,
): Promise<number> {
  try {
    const dir = ensureTranslationsDir();
    const file = new File(dir, `${id}.json`);
    if (!file.info().exists) file.create();
    file.write(json);
    return json.length;
  } catch {
    return 0;
  }
}

export async function deleteTranslation(id: TranslationKey): Promise<void> {
  try {
    const dir = translationsDir();
    const file = new File(dir, `${id}.json`);
    if (file.info().exists) file.delete();
  } catch {
    // Ignore.
  }
}

export async function getTranslationBytes(id: TranslationKey): Promise<number> {
  try {
    const dir = translationsDir();
    const file = new File(dir, `${id}.json`);
    if (!file.info().exists) return 0;
    return file.info().size ?? 0;
  } catch {
    return 0;
  }
}
