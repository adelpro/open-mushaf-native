import { useCallback, useEffect, useState } from 'react';

import { QuranText, WordMap } from '@/types';
import type { MorphologyAya } from '@/types/morphology-aya';
import { normalizeArabic } from '@/utils/arabic-utils';
import {
  performAdvancedLinguisticSearch,
  simpleSearch,
} from '@/utils/search-utils';

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

  const processSearchResults = useCallback(
    (
      simpleMatches: QuranText[],
      lemmaMatches: QuranText[],
      rootMatches: QuranText[],
    ) => {
      const gidSet = new Set<number>();
      const combined: ScoredQuranText[] = [];

      const scoreMatch = (
        verse: QuranText,
        matchTypes: { simple?: boolean; lemma?: boolean; root?: boolean },
      ): ScoredQuranText => {
        let matchScore = 0;
        let matchType: MatchType = 'none';

        if (matchTypes.simple) {
          matchScore = 100;
          matchType = 'exact';
        } else if (matchTypes.lemma) {
          matchScore = 70;
          matchType = 'lemma';
        } else if (matchTypes.root) {
          matchScore = 50;
          matchType = 'root';
        }

        return { ...verse, matchScore, matchType };
      };

      const pushIfNew = (
        v: QuranText,
        matchTypes: { simple?: boolean; lemma?: boolean; root?: boolean },
      ) => {
        if (!gidSet.has(v.gid)) {
          gidSet.add(v.gid);
          combined.push(scoreMatch(v, matchTypes));
        } else {
          const idx = combined.findIndex((item) => item.gid === v.gid);
          if (idx >= 0) {
            const existing = combined[idx];
            const newScored = scoreMatch(v, matchTypes);
            if (newScored.matchScore > existing.matchScore)
              combined[idx] = newScored;
          }
        }
      };

      for (const v of simpleMatches) pushIfNew(v, { simple: true });
      for (const v of lemmaMatches) pushIfNew(v, { lemma: true });
      for (const v of rootMatches) pushIfNew(v, { root: true });

      combined.sort((a, b) => b.matchScore - a.matchScore);

      setCounts({
        simple: simpleMatches.length,
        lemma: lemmaMatches.length,
        root: rootMatches.length,
        total: combined.length,
      });
      setFilteredResults(combined as QuranText[]);
    },
    [],
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

    const MAX_RESULTS_PER_TYPE = 500;

    const simpleMatches = simpleSearch(quranData, cleanQuery, 'standard').slice(
      0,
      MAX_RESULTS_PER_TYPE,
    );

    const lemmaMatches = advancedOptions.lemma
      ? performAdvancedLinguisticSearch(
          cleanQuery,
          quranData,
          { lemma: true, root: false },
          fuseInstance,
        ).slice(0, MAX_RESULTS_PER_TYPE)
      : [];

    const rootMatches = advancedOptions.root
      ? performAdvancedLinguisticSearch(
          cleanQuery,
          quranData,
          { lemma: false, root: true },
          fuseInstance,
        ).slice(0, MAX_RESULTS_PER_TYPE)
      : [];

    requestAnimationFrame(() =>
      processSearchResults(simpleMatches, lemmaMatches, rootMatches),
    );
  }, [query, quranData, fuseInstance, advancedOptions, processSearchResults]);

  return { filteredResults, counts, getPositiveTokens };
}
