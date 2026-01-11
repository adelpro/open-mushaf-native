import Fuse, { type IFuseOptions } from 'fuse.js';

import morphologyData from '@/assets/search/quran-morphology.json';
import wordMapJSON from '@/assets/search/word-map.json';
import type { QuranText, WordMap } from '@/types';

import { normalizeArabic } from './arabicUtils';

import type { MorphologyAya } from '@/types/morphology-aya';

// ==================== Morphology Map ====================
const GID_TO_MORPH = new Map<number, MorphologyAya>();
for (const morph of morphologyData) {
  GID_TO_MORPH.set(morph.gid, morph);
}

// ==================== Fuse.js Setup ====================
export const createArabicFuseSearch = <T>(
  collection: T[],
  keys: string[],
  options: Partial<IFuseOptions<T>> = {},
): Fuse<T> =>
  new Fuse(collection, {
    includeScore: true,
    threshold: 0.3, // stricter match
    distance: 50,
    ignoreLocation: true,
    minMatchCharLength: 2,
    useExtendedSearch: true,
    keys,
    ...options,
  });

// ==================== Arabic Query Cleaning ====================
const cleanArabicQuery = (query: string): string => {
  // Keep only Arabic letters and spaces
  return normalizeArabic(query.replace(/[^\u0600-\u06FF\s]+/g, '').trim());
};

// ==================== Simple Search ====================
export const simpleSearch = <T extends Record<string, any>>(
  items: T[],
  query: string,
  searchField: keyof T,
): T[] => {
  const cleanQuery = cleanArabicQuery(query);
  if (!cleanQuery) return [];

  return items.filter((item) => {
    const fieldValue = String(item[searchField] || '');
    return normalizeArabic(fieldValue).includes(cleanQuery);
  });
};

// ==================== Advanced Linguistic Search ====================
interface AdvancedOptions {
  lemma: boolean;
  root: boolean;
}

export const performAdvancedLinguisticSearch = (
  query: string,
  quranData: QuranText[],
  options: AdvancedOptions,
  fuseInstance: Fuse<QuranText>,
): QuranText[] => {
  const cleanQuery = cleanArabicQuery(query);
  if (!cleanQuery) return [];

  const wordMap = wordMapJSON as WordMap;
  const entry = wordMap[cleanQuery];
  if (!entry) return fuseInstance.search(cleanQuery).map((r) => r.item);

  const { lemma: targetLemma, root: targetRoot = '' } = entry;
  const matchingGids = new Set<number>();
  const getMorph = (gid: number) => GID_TO_MORPH.get(gid);

  if (options.lemma && targetLemma) {
    for (const verse of quranData) {
      const morph = getMorph(verse.gid);
      if (morph?.lemmas.includes(targetLemma)) matchingGids.add(verse.gid);
    }
  }

  if (options.root && targetRoot) {
    for (const verse of quranData) {
      const morph = getMorph(verse.gid);
      if (morph?.roots.includes(targetRoot)) matchingGids.add(verse.gid);
    }
  }

  if (matchingGids.size > 0) {
    const gidToVerse = new Map(quranData.map((v) => [v.gid, v]));
    return Array.from(matchingGids).map((gid) => gidToVerse.get(gid)!);
  }

  return fuseInstance.search(cleanQuery).map((r) => r.item);
};
