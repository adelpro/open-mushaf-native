import { useCallback, useEffect, useMemo, useState } from 'react';

import { search, type SearchResponse, type WordMap } from 'quran-search-engine';

import { AdvancedOptions, MorphologyAya, QuranText } from '@/types';

interface Counts {
  simple: number;
  lemma: number;
  root: number;
  fuzzy: number;
  total: number;
}

interface UseQuranSearchProps {
  quranData: QuranText[] | null;
  morphologyData: MorphologyAya[];
  wordMap: WordMap;
  query: string;
  advancedOptions: AdvancedOptions;
  fuseInstance: any | null;
  page: number;
  limit: number;
}

/**
 * Hook to interface with the core Quran search engine.
 * Processes queries, normalizes Arabic text, and fetches matches across the loaded metadata.
 *
 * @param props - Configuration properties for executing a localized Quran search.
 * @param props.quranData - The loaded Quranic text dataset.
 * @param props.morphologyData - The loaded morphology metadata for advanced search matching.
 * @param props.wordMap - The mapping of generic words for indexing.
 * @param props.query - The user input search string.
 * @param props.advancedOptions - Config object to enable lemma, root, or fuzzy matching.
 * @param props.fuseInstance - Optional pre-instantiated Fuse.js index.
 * @param props.page - The pagination page.
 * @param props.limit - The maximum results per page.
 *
 * @returns An object containing `pageResults`, search metric `counts`, and a helper for identifying `getPositiveTokens`.
 */
export function useQuranSearch({
  quranData,
  morphologyData,
  wordMap,
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
    total: 0,
  });

  // Convert morphology array to Map format for the package
  const morphologyMap = useMemo(() => {
    const map = new Map<number, MorphologyAya>();
    for (const morph of morphologyData) {
      map.set(morph.gid, morph);
    }
    return map;
  }, [morphologyData]);

  const getPositiveTokens = useCallback(
    (
      verse: QuranText,
      mode: 'text' | 'lemma' | 'root' | 'fuzzy',
      targetLemma?: string,
      targetRoot?: string,
      cleanQuery?: string,
    ): string[] => {
      if (!cleanQuery) return [];

      const matchedTokens = (verse as any).matchedTokens || [];
      const tokenTypes = (verse as any).tokenTypes || {};

      if (mode === 'text') {
        return matchedTokens.filter(
          (token: string) => tokenTypes[token] === 'exact',
        );
      }
      if (mode === 'lemma') {
        return matchedTokens.filter(
          (token: string) => tokenTypes[token] === 'lemma',
        );
      }
      if (mode === 'root') {
        return matchedTokens.filter(
          (token: string) => tokenTypes[token] === 'root',
        );
      }
      if (mode === 'fuzzy') {
        return matchedTokens.filter(
          (token: string) => tokenTypes[token] === 'fuzzy',
        );
      }

      return matchedTokens;
    },
    [],
  );

  useEffect(() => {
    if (!quranData || quranData.length === 0) {
      setPageResults([]);
      setCounts({ simple: 0, lemma: 0, root: 0, fuzzy: 0, total: 0 });
      return;
    }

    const arabicOnly = (query ?? '').replace(/[^\u0621-\u064A\s]/g, '').trim();

    if (!arabicOnly) {
      setPageResults([]);
      setCounts({ simple: 0, lemma: 0, root: 0, fuzzy: 0, total: 0 });
      return;
    }

    try {
      const response: SearchResponse = search(
        arabicOnly,
        quranData,
        morphologyMap,
        wordMap,
        {
          lemma: advancedOptions.lemma,
          root: advancedOptions.root,
          fuzzy: advancedOptions.fuzzy,
        },
        {
          page,
          limit,
        },
      );

      setCounts({
        simple: response.counts.simple,
        lemma: response.counts.lemma,
        root: response.counts.root,
        fuzzy: response.counts.fuzzy,
        total: response.counts.total,
      });

      setPageResults(response.results as QuranText[]);
    } catch (error) {
      console.error('Search error:', error);
      setPageResults([]);
      setCounts({ simple: 0, lemma: 0, root: 0, fuzzy: 0, total: 0 });
    }
  }, [query, quranData, morphologyMap, wordMap, advancedOptions, page, limit]);

  return { pageResults, counts, getPositiveTokens };
}
