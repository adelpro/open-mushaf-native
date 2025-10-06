import Fuse, { type IFuseOptions } from 'fuse.js';

// =============== ARABIC NORMALIZATION ===============
export const removeTashkeel = (text: string): string => {
  return text
    .replace(/\u0671/g, '\u0627') // Wasl alef → regular alef
    .replace(
      /[\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E8\u06EA-\u06FC]/g,
      '',
    );
};

export const normalizeArabicText = (text: string): string => {
  if (!text) return '';
  let normalized = removeTashkeel(text);
  normalized = normalized
    .replace(/[\u0622\u0623\u0625]/g, '\u0627') // Alef variants → ا
    .replace(/[\u0624\u0626]/g, '\u0621') // Hamza variants → ء
    .replace(/\u0649/g, '\u064A') // Alif maqsura → ي
    .replace(/\u0640/g, '') // Tatweel
    .replace(/[\u0654\u0655]/g, '\u0621'); // Hamza above/below
  return normalized;
};

// =============== FUSE SETUP ===============
export const createArabicFuseSearch = <T>(
  collection: T[],
  keys: string[] = ['standard'],
  options: Partial<IFuseOptions<T>> = {},
): Fuse<T> => {
  return new Fuse(collection, {
    includeScore: true,
    threshold: 0.3, // Stricter for Arabic
    ignoreLocation: true,
    useExtendedSearch: false,
    keys,
    ...options,
  });
};

// =============== SIMPLE SEARCH (Lemma-aware + Fuse fallback) ===============
export const simpleSearch = <T extends QuranVerse>(
  items: T[],
  morphologyData: MorphologyVerse[],
  query: string,
): T[] => {
  if (!query.trim()) return [];

  const normQuery = normalizeArabicText(query);
  const matchingGids = new Set<number>();

  for (const morph of morphologyData) {
    if (
      morph.lemmas.some((lemma) => normalizeArabicText(lemma) === normQuery)
    ) {
      matchingGids.add(morph.gid);
    }
  }

  const gidToVerse = new Map(items.map((v) => [v.gid, v]));
  return Array.from(matchingGids).map((gid) => gidToVerse.get(gid)!);
};

export const performSimpleSearch = <T extends QuranVerse>(
  fuseInstance: Fuse<T>,
  query: string,
  originalCollection: T[],
  morphologyData: MorphologyVerse[],
): T[] => {
  if (!query.trim()) return [];

  const exactMatches = simpleSearch(originalCollection, morphologyData, query);
  if (exactMatches.length > 0) return exactMatches;

  // Fallback to Fuse for typos/unknown words
  return fuseInstance
    .search(normalizeArabicText(query))
    .map((result) => result.item);
};

// =============== ADVANCED SEARCH (Root + Lemma + Semantic) ===============
export interface WordMapEntry {
  lemma: string;
  root: string;
}

// Load at startup: import wordMap from '/data/wordmap.json';
export const getLemmaAndRoot = (
  wordMap: Record<string, WordMapEntry>,
  normalizedWord: string,
): WordMapEntry | null => {
  return wordMap[normalizedWord] || null;
};

// Load at startup: import rootClusters from '/data/root-clusters.json';
export const performAdvancedSearch = <T extends QuranVerse>(
  query: string,
  items: T[],
  morphologyData: MorphologyVerse[],
  wordMap: Record<string, WordMapEntry>,
  rootClusters: Record<string, string[]>, // e.g., { "ر-ح-م": ["ر-ح-م", "غ-ف-ر"] }
): T[] => {
  if (!query.trim()) return [];

  const normQuery = normalizeArabicText(query);
  const wordInfo = getLemmaAndRoot(wordMap, normQuery);

  if (!wordInfo) {
    return []; // Word not in Quran → no linguistic results
  }

  const { root } = wordInfo;
  const gidSet = new Set<number>();

  // 1. Lemma matches (all forms of the word)
  const lemmaGids = morphologyData
    .filter((morph) =>
      morph.lemmas.some((l) => normalizeArabicText(l) === normQuery),
    )
    .map((morph) => morph.gid);
  lemmaGids.forEach((id) => gidSet.add(id));

  // 2. Root matches (all words from the same root)
  const rootGids = morphologyData
    .filter((morph) => morph.roots.includes(root))
    .map((morph) => morph.gid);
  rootGids.forEach((id) => gidSet.add(id));

  // 3. Semantic matches (related roots)
  const semanticRoots = rootClusters[root] || [root];
  const semanticGids = morphologyData
    .filter((morph) => morph.roots.some((r) => semanticRoots.includes(r)))
    .map((morph) => morph.gid);
  semanticGids.forEach((id) => gidSet.add(id));

  // Return results
  const gidToVerse = new Map(items.map((v) => [v.gid, v]));
  return Array.from(gidSet).map((gid) => gidToVerse.get(gid)!);
};
