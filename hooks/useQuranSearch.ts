import { useEffect, useMemo, useState } from 'react';

import {
  LRUCache,
  search,
  type SearchResponse,
  type WordMap,
} from 'quran-search-engine';

import { MorphologyAya, QuranText, SearchOptions } from '@/types';

interface Counts {
  simple: number;
  lemma: number;
  root: number;
  fuzzy: number;
  semantic: number;
  total: number;
}

interface UseQuranSearchProps {
  quranData: QuranText[] | null;
  morphologyData: MorphologyAya[];
  wordMap: WordMap;
  semanticMap?: any;
  phoneticMap?: any;
  invertedIndex?: any;
  query: string;
  advancedOptions: SearchOptions;
  fuseInstance: any | null;
  page: number;
  limit: number;
}

// Global cache instance across re-renders
const searchCache = new LRUCache<string, any>(100);

/**
 * Hook to interface with the core Quran search engine.
 * Processes queries, normalizes Arabic text, and fetches matches across the loaded metadata.
 */
export function useQuranSearch({
  quranData,
  morphologyData,
  wordMap,
  semanticMap,
  phoneticMap,
  invertedIndex,
  query,
  advancedOptions,
  fuseInstance,
  page,
  limit,
}: UseQuranSearchProps) {
  const [pageResults, setPageResults] = useState<QuranText[]>([]);
  const [counts, setCounts] = useState<Counts>({
    simple: 0,
    lemma: 0,
    root: 0,
    fuzzy: 0,
    semantic: 0,
    total: 0,
  });

  // Convert morphology array to Map format for the package
  const morphologyMap = useMemo(() => {
    const map = new Map<number, MorphologyAya>();
    if (!morphologyData) return map;
    for (const morph of morphologyData) {
      map.set(morph.gid, morph);
    }
    return map;
  }, [morphologyData]);

  // Convert quran array to Map format for the v0.3 package
  const quranMap = useMemo(() => {
    const map = new Map<number, QuranText>();
    if (!quranData) return map;
    for (const verse of quranData) {
      map.set(verse.gid, verse);
    }
    return map;
  }, [quranData]);

  useEffect(() => {
    if (!quranData || quranData.length === 0) {
      setPageResults([]);
      setCounts({
        simple: 0,
        lemma: 0,
        root: 0,
        fuzzy: 0,
        semantic: 0,
        total: 0,
      });
      return;
    }

    // Allow english characters, logic operators, and numbers for ranges/phonetics/semantics
    let processedQuery = (query ?? '').trim();

    if (!processedQuery) {
      setPageResults([]);
      setCounts({
        simple: 0,
        lemma: 0,
        root: 0,
        fuzzy: 0,
        semantic: 0,
        total: 0,
      });
      return;
    }

    try {
      // New v0.3 API: search(query, context, options, pagination, fuseIndex, cache)
      const response: SearchResponse<QuranText> = search(
        processedQuery,
        {
          quranData: quranMap,
          morphologyMap,
          wordMap,
          semanticMap,
          phoneticMap,
          invertedIndex,
        },
        advancedOptions,
        {
          page,
          limit,
        },
        fuseInstance,
        searchCache,
      );

      setCounts({
        simple: response.counts.simple || 0,
        lemma: response.counts.lemma || 0,
        root: response.counts.root || 0,
        fuzzy: response.counts.fuzzy || 0,
        semantic: (response.counts as any).semantic || 0,
        total: response.counts.total || 0,
      });

      setPageResults((response.results as QuranText[]) || []);
    } catch (error) {
      console.error('Search error:', error);
      setPageResults([]);
      setCounts({
        simple: 0,
        lemma: 0,
        root: 0,
        fuzzy: 0,
        semantic: 0,
        total: 0,
      });
    }
  }, [
    query,
    quranData,
    quranMap,
    morphologyMap,
    wordMap,
    semanticMap,
    phoneticMap,
    invertedIndex,
    advancedOptions,
    page,
    limit,
    fuseInstance,
  ]);

  return { pageResults, counts };
}
