/**
 * Keyword path of the hybrid search pipeline.
 *
 * Thin wrapper around quran-search-engine's synchronous `search()` that
 * enables lemma + root + fuzzy matching and returns a gid → rank map suitable
 * for RRF fusion.
 */

import { search, type SearchResponse, type WordMap } from 'quran-search-engine';

import { MorphologyAya, QuranText } from '@/types';

/**
 * Run keyword search and project the response into a gid → rank map.
 *
 * Caller is responsible for ensuring the morphology + wordMap are loaded
 * (use hooks/useQuranMetadata to obtain them).
 */
export function runKeywordPath(args: {
  query: string;
  quranData: QuranText[];
  morphologyData: MorphologyAya[];
  wordMap: WordMap;
  topK?: number;
}): Map<number, number> {
  const { query, quranData, morphologyData, wordMap, topK = 200 } = args;
  if (!query.trim()) return new Map();

  const morphologyMap = new Map<number, MorphologyAya>();
  for (const m of morphologyData) morphologyMap.set(m.gid, m);

  const quranMap = new Map<number, QuranText>();
  for (const v of quranData) quranMap.set(v.gid, v);

  const response: SearchResponse<QuranText> = search(
    query,
    { quranData: quranMap, morphologyMap, wordMap },
    {
      lemma: true,
      root: true,
      fuzzy: true,
      isRegex: false,
    },
    { page: 1, limit: topK },
    undefined, // fuseInstance — quran-search-engine will lazy-init internally if needed
    undefined, // cache — pass undefined to disable caching for the AI path
  );

  const out = new Map<number, number>();
  const results = response?.results ?? [];
  results.forEach((verse, idx) => {
    if (!out.has(verse.gid)) {
      out.set(verse.gid, idx + 1);
    }
  });
  return out;
}
