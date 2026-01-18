import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  type MorphologyAya,
  type QuranText,
  search,
  type SearchResponse,
  type WordMap,
} from 'quran-search-engine';

interface AdvancedOptions {
  lemma: boolean;
  root: boolean;
  fuzzy: boolean;
}

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

export default function useQuranSearch({
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
