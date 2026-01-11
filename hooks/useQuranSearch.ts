import { useCallback, useEffect, useState } from 'react';

import { QuranText, WordMap } from '@/types';
import { normalizeArabic } from '@/utils/arabicUtils';
import {
  performAdvancedLinguisticSearch,
  simpleSearch,
} from '@/utils/searchUtils';

import type { MorphologyAya } from '@/types/morphology-aya';

type MatchType = 'exact' | 'lemma' | 'root' | 'fuzzy' | 'none';

interface ScoredQuranText extends QuranText {
  matchScore: number;
  matchType: MatchType;
}

interface AdvancedOptions {
  lemma: boolean;
  root: boolean;
}

interface Counts {
  simple: number;
  lemma: number;
  root: number;
  total: number;
}

interface UseQuranSearchProps {
  quranData: QuranText[] | null;
  morphologyData: MorphologyAya[];
  wordMap: WordMap;
  query: string;
  advancedOptions: AdvancedOptions;
  fuseInstance: any | null;
}

export default function useQuranSearch({
  quranData,
  morphologyData,
  wordMap,
  query,
  advancedOptions,
  fuseInstance,
}: UseQuranSearchProps) {
  const [filteredResults, setFilteredResults] = useState<QuranText[]>([]);
  const [counts, setCounts] = useState<Counts>({
    simple: 0,
    lemma: 0,
    root: 0,
    total: 0,
  });

  const getMorphByGid = useCallback(
    (gid: number) => morphologyData.find((m) => m.gid === gid),
    [morphologyData],
  );

  const getPositiveTokens = useCallback(
    (
      verse: QuranText,
      mode: 'text' | 'lemma' | 'root',
      targetLemma?: string,
      targetRoot?: string,
      cleanQuery?: string,
    ): string[] => {
      if (!cleanQuery) return [];

      const normalizedQuery = normalizeArabic(cleanQuery);

      if (mode === 'text') {
        const words = (verse.standard || '')
          .split(/\s+/)
          .map((w) => w.replace(/[^\u0621-\u064A]/g, ''));
        return Array.from(
          new Set(
            words.filter((w) => normalizeArabic(w).includes(normalizedQuery)),
          ),
        );
      }

      const morph = getMorphByGid(verse.gid);
      if (!morph) return [];

      if (mode === 'lemma' && targetLemma) {
        const normTarget = normalizeArabic(targetLemma);
        return Array.from(
          new Set(
            morph.lemmas.filter((l) => normalizeArabic(l).includes(normTarget)),
          ),
        );
      }

      if (mode === 'root' && targetRoot) {
        const normTarget = normalizeArabic(targetRoot);
        return Array.from(
          new Set(
            morph.roots.filter((r) => normalizeArabic(r).includes(normTarget)),
          ),
        );
      }

      return [];
    },
    [getMorphByGid],
  );

  // -----------------------------
  // Compute relevance score
  // -----------------------------
  const computeScore = useCallback(
    (
      verse: QuranText,
      cleanQuery: string,
      mapEntry: { lemma?: string; root?: string } | undefined,
    ): ScoredQuranText => {
      let score = 0;
      let matchType: MatchType = 'none';

      const textMatches = getPositiveTokens(
        verse,
        'text',
        undefined,
        undefined,
        cleanQuery,
      );
      if (textMatches.length > 0) {
        score += textMatches.length * 3;
        matchType = 'exact';
      }

      if (advancedOptions.lemma && mapEntry?.lemma) {
        const lemmaMatches = getPositiveTokens(
          verse,
          'lemma',
          mapEntry.lemma,
          undefined,
          cleanQuery,
        );
        if (lemmaMatches.length > 0) {
          score += lemmaMatches.length * 2;
          if (score > 0 && matchType !== 'exact') matchType = 'lemma';
        }
      }

      if (advancedOptions.root && mapEntry?.root) {
        const rootMatches = getPositiveTokens(
          verse,
          'root',
          undefined,
          mapEntry.root,
          cleanQuery,
        );
        if (rootMatches.length > 0) {
          score += rootMatches.length;
          if (score > 0 && matchType !== 'exact' && matchType !== 'lemma')
            matchType = 'root';
        }
      }

      return { ...verse, matchScore: score, matchType };
    },
    [advancedOptions, getPositiveTokens],
  );

  const processSearchResults = useCallback(
    (results: QuranText[], cleanQuery: string) => {
      const gidSet = new Set<number>();
      const combined: ScoredQuranText[] = [];

      for (const v of results) {
        if (!gidSet.has(v.gid)) {
          gidSet.add(v.gid);
          const mapEntry = wordMap[cleanQuery];
          combined.push(computeScore(v, cleanQuery, mapEntry));
        }
      }

      combined.sort((a, b) => b.matchScore - a.matchScore);

      // Counts
      setCounts({
        simple: combined.filter((v) => v.matchType === 'exact').length,
        lemma: combined.filter((v) => v.matchType === 'lemma').length,
        root: combined.filter((v) => v.matchType === 'root').length,
        total: combined.length,
      });

      setFilteredResults(combined as QuranText[]);
    },
    [computeScore, wordMap],
  );

  useEffect(() => {
    if (!quranData || !fuseInstance) {
      setFilteredResults([]);
      setCounts({ simple: 0, lemma: 0, root: 0, total: 0 });
      return;
    }

    const arabicOnly = (query ?? '').replace(/[^\u0621-\u064A\s]/g, '').trim();
    const cleanQuery = normalizeArabic(arabicOnly);

    if (!cleanQuery) {
      setFilteredResults([]);
      setCounts({ simple: 0, lemma: 0, root: 0, total: 0 });
      return;
    }

    const MAX_RESULTS = 500;

    const simpleMatches = simpleSearch(quranData, cleanQuery, 'standard').slice(
      0,
      MAX_RESULTS,
    );

    const advancedMatches = [
      ...(advancedOptions.lemma
        ? performAdvancedLinguisticSearch(
            cleanQuery,
            quranData,
            { lemma: true, root: false },
            fuseInstance,
          ).slice(0, MAX_RESULTS)
        : []),
      ...(advancedOptions.root
        ? performAdvancedLinguisticSearch(
            cleanQuery,
            quranData,
            { lemma: false, root: true },
            fuseInstance,
          ).slice(0, MAX_RESULTS)
        : []),
    ];

    const allMatches = [...simpleMatches, ...advancedMatches];

    requestAnimationFrame(() => processSearchResults(allMatches, cleanQuery));
  }, [query, quranData, fuseInstance, advancedOptions, processSearchResults]);

  return { filteredResults, counts, getPositiveTokens };
}
