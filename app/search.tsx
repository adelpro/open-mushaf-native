import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

import { Feather, Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import morphologyDataRaw from '@/assets/search/quran-morphology.json';
import wordMapJSON from '@/assets/search/word-map.json';
import { HighlightText } from '@/components/highlight-arabic';
import SEO from '@/components/seo';
import TafseerPopup from '@/components/TafseerPopup';
import { ThemedTextInput } from '@/components/ThemedInput';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useColors } from '@/hooks/useColors';
import useDebounce from '@/hooks/useDebounce';
import useQuranMetadata from '@/hooks/useQuranMetadata';
import { QuranText, WordMap } from '@/types';
import type { MorphologyAya } from '@/types/morphology-aya';
import { normalizeArabic } from '@/utils/arabic-utils';
import {
  createArabicFuseSearch,
  performAdvancedLinguisticSearch,
  simpleSearch,
} from '@/utils/search-utils';

// Match type enum for search results
type MatchType = 'exact' | 'lemma' | 'root' | 'fuzzy' | 'none';

// Extended QuranText with match information
interface ScoredQuranText extends QuranText {
  matchScore: number;
  matchType: MatchType;
}

const MORPH = morphologyDataRaw as MorphologyAya[];
const WORD_MAP = wordMapJSON as WordMap;

export default function Search() {
  const { quranData, isLoading, error } = useQuranMetadata();
  const { tintColor, primaryColor } = useColors();

  const [query, setQuery] = useState('');
  const [inputText, setInputText] = useState('');
  const [filteredResults, setFilteredResults] = useState<QuranText[]>([]);
  const [show, setShow] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [advancedOptions, setAdvancedOptions] = useState({
    lemma: false,
    root: false,
  });
  const [selectedAya, setSelectedAya] = useState({ aya: 0, surah: 0 });

  const [counts, setCounts] = useState({
    simple: 0,
    lemma: 0,
    root: 0,
    total: 0,
  });

  const fuseInstance = useMemo(
    () =>
      quranData
        ? createArabicFuseSearch(quranData, ['standard'], {
            threshold: 0.3,
            minMatchCharLength: 2,
          })
        : null,
    [quranData],
  );

  const handleSearch = useDebounce((text: string) => {
    setQuery(text);
  }, 200);

  const getMorphByGid = useCallback(
    (gid: number) => MORPH.find((m) => m.gid === gid),
    [],
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

      // --- Text search ---
      if (mode === 'text') {
        const words = (verse.standard || '')
          .split(/\s+/)
          .map((w) => w.replace(/[^\u0621-\u064A]/g, ''));

        // return only words that actually include the query
        return Array.from(
          new Set(
            words.filter((w) => normalizeArabic(w).includes(normalizedQuery)),
          ),
        );
      }

      // --- Lemma / Root search ---
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

  useEffect(() => {
    if (!quranData || !fuseInstance) {
      setFilteredResults([]);
      setCounts({ simple: 0, lemma: 0, root: 0, total: 0 });
      return;
    }

    const raw = query ?? '';
    const arabicOnly = raw.replace(/[^\u0621-\u064A\s]/g, '').trim();
    const cleanQuery = normalizeArabic(arabicOnly);
    if (!cleanQuery) {
      setFilteredResults([]);
      setCounts({ simple: 0, lemma: 0, root: 0, total: 0 });
      return;
    }

    // Performance optimization: Use a timeout to avoid blocking the UI
    const searchTimeoutId = setTimeout(() => {
      const useLemma = advancedOptions.lemma;
      const useRoot = advancedOptions.root;

      // Performance optimization: Limit initial search results for better responsiveness
      const MAX_RESULTS_PER_TYPE = 500;

      const simpleMatches = simpleSearch(
        quranData,
        cleanQuery,
        'standard',
      ).slice(0, MAX_RESULTS_PER_TYPE);

      const lemmaMatches = useLemma
        ? performAdvancedLinguisticSearch(
            cleanQuery,
            quranData,
            { lemma: true, root: false },
            fuseInstance,
          ).slice(0, MAX_RESULTS_PER_TYPE)
        : [];

      const rootMatches = useRoot
        ? performAdvancedLinguisticSearch(
            cleanQuery,
            quranData,
            { lemma: false, root: true },
            fuseInstance,
          ).slice(0, MAX_RESULTS_PER_TYPE)
        : [];

      // Process search results in the next frame to avoid UI blocking
      requestAnimationFrame(() => {
        processSearchResults(simpleMatches, lemmaMatches, rootMatches);
      });
    }, 100); // Small delay for better typing experience

    return () => clearTimeout(searchTimeoutId);
  }, [query, quranData, fuseInstance, advancedOptions, getPositiveTokens]);

  // Extracted function to process search results (improves code organization)
  const processSearchResults = useCallback(
    (
      simpleMatches: QuranText[],
      lemmaMatches: QuranText[],
      rootMatches: QuranText[],
    ) => {
      const gidSet = new Set<number>();
      const combined: ScoredQuranText[] = [];

      // Calculate scores for each match type
      const scoreMatch = (
        verse: QuranText,
        matchTypes: { simple?: boolean; lemma?: boolean; root?: boolean },
      ): ScoredQuranText => {
        let matchScore = 0;
        let matchType: MatchType = 'none';

        // Prioritize exact matches (100 points)
        if (matchTypes.simple) {
          matchScore = 100;
          matchType = 'exact';
        }
        // Then lemma matches (70 points)
        else if (matchTypes.lemma) {
          matchScore = 70;
          matchType = 'lemma';
        }
        // Then root matches (50 points)
        else if (matchTypes.root) {
          matchScore = 50;
          matchType = 'root';
        }

        return {
          ...verse,
          matchScore,
          matchType,
        };
      };

      const pushIfNew = (
        v: QuranText,
        matchTypes: { simple?: boolean; lemma?: boolean; root?: boolean },
      ) => {
        if (!gidSet.has(v.gid)) {
          gidSet.add(v.gid);
          combined.push(scoreMatch(v, matchTypes));
        } else {
          // If already exists, update score if this match type has higher priority
          const existingIndex = combined.findIndex(
            (item) => item.gid === v.gid,
          );
          if (existingIndex >= 0) {
            const existing = combined[existingIndex];
            const newScored = scoreMatch(v, matchTypes);

            if (newScored.matchScore > existing.matchScore) {
              combined[existingIndex] = newScored;
            }
          }
        }
      };

      // Add verses with their match types
      for (const v of simpleMatches) pushIfNew(v, { simple: true });
      for (const v of lemmaMatches) pushIfNew(v, { lemma: true });
      for (const v of rootMatches) pushIfNew(v, { root: true });

      // Sort results by match score (highest first)
      combined.sort((a, b) => b.matchScore - a.matchScore);

      const simpleCount = simpleMatches.length;
      const lemmaCount = lemmaMatches.length;
      const rootCount = rootMatches.length;
      const totalUnique = combined.length;

      setCounts({
        simple: simpleCount,
        lemma: lemmaCount,
        root: rootCount,
        total: totalUnique,
      });
      setFilteredResults(combined as QuranText[]);

      // Debug logging
      const cleanQuery = normalizeArabic(
        (query ?? '').replace(/[^\u0621-\u064A\s]/g, '').trim(),
      );
      console.groupCollapsed(`🔍 Search Debug — "${cleanQuery}"`);
      console.log(
        'Mode:',
        advancedOptions.lemma || advancedOptions.root
          ? `Advanced (lemma=${advancedOptions.lemma}, root=${advancedOptions.root})`
          : 'Simple text',
      );
      const mapEntry = WORD_MAP[cleanQuery];
      if (mapEntry) console.log('WordMap entry:', mapEntry);
      console.log(
        `Counts → text: ${simpleCount}, lemma: ${lemmaCount}, root: ${rootCount}, total unique: ${totalUnique}`,
      );

      const sample = combined.slice(0, 50);
      for (const v of sample) {
        const positiveTokens: string[] = [];
        if (simpleMatches.find((x) => x.gid === v.gid)) {
          positiveTokens.push(
            ...getPositiveTokens(v, 'text', undefined, undefined, cleanQuery),
          );
        }
        if (lemmaMatches.find((x) => x.gid === v.gid)) {
          const mappedLemma = mapEntry?.lemma;
          positiveTokens.push(
            ...getPositiveTokens(
              v,
              'lemma',
              mappedLemma,
              undefined,
              cleanQuery,
            ),
          );
        }
        if (rootMatches.find((x) => x.gid === v.gid)) {
          const mappedRoot = mapEntry?.root;
          positiveTokens.push(
            ...getPositiveTokens(v, 'root', undefined, mappedRoot, cleanQuery),
          );
        }

        const tokensStr =
          Array.from(new Set(positiveTokens)).join(' | ') ||
          '(no explicit token)';
        console.log(`[${v.sura_name}:${v.aya_id}] → ${tokensStr}`);
      }

      if (!mapEntry && (advancedOptions.lemma || advancedOptions.root)) {
        console.log(
          'Suggestion: add the query form to word-map.json to enable precise lemma/root matching.',
        );
      }

      console.groupEnd();
    },
    [query, advancedOptions, getPositiveTokens],
  );

  // Add processSearchResults to the dependencies of the search effect
  useEffect(() => {
    // The main search effect is now defined above
  }, [
    query,
    quranData,
    fuseInstance,
    advancedOptions,
    getPositiveTokens,
    processSearchResults,
  ]);

  const handlePress = (aya: QuranText) => {
    setSelectedAya({ aya: aya.aya_id, surah: aya.sura_id });
    setShow(true);
  };

  const toggleOption = (option: keyof typeof advancedOptions) => {
    setAdvancedOptions((prev) => ({
      ...prev,
      [option]: !prev[option],
    }));
  };

  const renderItem = ({ item }: { item: QuranText }) => {
    // collect matched tokens from all active search modes
    const directTokens: string[] = [];
    const relatedTokens: string[] = [];
    const fuzzyTokens: string[] = [];

    const mapEntry = WORD_MAP[normalizeArabic(query.trim())];
    const cleanQuery = normalizeArabic(query.trim());

    if (filteredResults.find((v) => v.gid === item.gid)) {
      // For simple text search, all matches are direct
      if (!advancedOptions.lemma && !advancedOptions.root) {
        const textMatches = getPositiveTokens(
          item,
          'text',
          undefined,
          undefined,
          query,
        );
        directTokens.push(...textMatches);

        // Handle fuzzy matches for simple search
        // If this verse is in results but no direct matches, it's likely a fuzzy match
        if (textMatches.length === 0) {
          // Extract potential fuzzy matches by splitting the verse into words
          const words = item.standard
            .split(/\s+/)
            .map((w) => w.replace(/[^\u0621-\u064A]/g, ''));

          // Find words that are similar to the query (potential fuzzy matches)
          for (const word of words) {
            if (
              word.length > 0 &&
              (word.includes(cleanQuery) ||
                cleanQuery.includes(word) ||
                isArabicWordRelated(normalizeArabic(word), cleanQuery) ||
                levenshteinDistance(normalizeArabic(word), cleanQuery) <= 2)
            ) {
              fuzzyTokens.push(word);
            }
          }
        }
      } else {
        // For linguistic searches, we need to separate direct and related matches
        const textMatches = getPositiveTokens(
          item,
          'text',
          undefined,
          undefined,
          query,
        );
        directTokens.push(...textMatches);

        // Lemma-based matches
        if (advancedOptions.lemma && mapEntry?.lemma) {
          const lemmaMatches = getPositiveTokens(
            item,
            'lemma',
            mapEntry.lemma,
            undefined,
            query,
          );

          // Words that match by lemma but aren't direct text matches are "related"
          const lemmaRelated = lemmaMatches.filter(
            (word) => !textMatches.includes(word),
          );
          relatedTokens.push(...lemmaRelated);
        }

        // Root-based matches
        if (advancedOptions.root && mapEntry?.root) {
          const rootMatches = getPositiveTokens(
            item,
            'root',
            undefined,
            mapEntry.root,
            query,
          );

          // Words that match by root but aren't direct text matches are "related"
          const rootRelated = rootMatches.filter(
            (word) =>
              !textMatches.includes(word) && !relatedTokens.includes(word),
          );
          relatedTokens.push(...rootRelated);
        }

        // Handle fuzzy matches for linguistic search
        // If this verse is in results but no direct or linguistic matches, it's likely a fuzzy match
        if (textMatches.length === 0 && relatedTokens.length === 0) {
          const words = item.standard
            .split(/\s+/)
            .map((w) => w.replace(/[^\u0621-\u064A]/g, ''));
          for (const word of words) {
            if (
              word.length > 0 &&
              (word.includes(cleanQuery) ||
                cleanQuery.includes(word) ||
                isArabicWordRelated(normalizeArabic(word), cleanQuery) ||
                levenshteinDistance(normalizeArabic(word), cleanQuery) <= 2)
            ) {
              fuzzyTokens.push(word);
            }
          }
        }
      }
    }

    // Helper function to calculate Levenshtein distance for fuzzy matching
    function levenshteinDistance(a: string, b: string): number {
      if (a.length === 0) return b.length;
      if (b.length === 0) return a.length;

      const matrix = [];

      // Initialize matrix
      for (let i = 0; i <= b.length; i++) {
        matrix[i] = [i];
      }
      for (let j = 0; j <= a.length; j++) {
        matrix[0][j] = j;
      }

      // Fill matrix
      for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
          const cost = a[j - 1] === b[i - 1] ? 0 : 1;
          matrix[i][j] = Math.min(
            matrix[i - 1][j] + 1, // deletion
            matrix[i][j - 1] + 1, // insertion
            matrix[i - 1][j - 1] + cost, // substitution
          );
        }
      }

      return matrix[b.length][a.length];
    }

    // Helper function to check if a word is related to the query
    function isArabicWordRelated(word: string, query: string): boolean {
      // Skip very short words (less than 2 characters)
      if (word.length < 2 || query.length < 2) {
        return false;
      }

      // Normalize both words
      const normalizedWord = normalizeArabic(word);
      const normalizedQuery = normalizeArabic(query);

      // Exact match
      if (normalizedWord === normalizedQuery) {
        return true;
      }

      // Direct substring match (one contains the other completely)
      if (normalizedWord.includes(normalizedQuery)) {
        return true;
      }

      // Only include query containing word for longer queries (to avoid false positives)
      if (
        normalizedQuery.length >= 4 &&
        normalizedQuery.includes(normalizedWord)
      ) {
        return true;
      }

      // For very similar words with small edit distance (like ناصرين/ناضرين)
      // Only consider words very close to each other (1 character difference)
      if (Math.abs(normalizedWord.length - normalizedQuery.length) <= 1) {
        const distance = levenshteinDistance(normalizedWord, normalizedQuery);
        if (distance <= 1) {
          return true;
        }
      }

      // Extract core part (remove common prefixes and suffixes)
      const extractCore = (text: string): string => {
        // Only remove common prefixes and suffixes
        const withoutPrefixes = text.replace(/^(ال|وال|بال|فال|كال|لل)/g, '');
        const core = withoutPrefixes.replace(/(ون|ين|ات|ان|ها|هم)$/g, '');
        return core;
      };

      const wordCore = extractCore(normalizedWord);
      const queryCore = extractCore(normalizedQuery);

      // If either core is too short (less than 3 chars), it's not reliable
      if (wordCore.length < 3 || queryCore.length < 3) {
        return false;
      }

      // Check if cores match exactly
      if (wordCore === queryCore) {
        return true;
      }

      // For specific cases like ناصري/ناصر, check if they share the same root
      // by comparing the first 3-4 characters (typical Arabic root length)
      const minLength = Math.min(wordCore.length, queryCore.length);
      if (minLength >= 3) {
        const wordPrefix = wordCore.substring(0, Math.min(4, minLength));
        const queryPrefix = queryCore.substring(0, Math.min(4, minLength));

        if (wordPrefix === queryPrefix) {
          return true;
        }
      }

      // Much stricter than before - we don't use general LCS or Levenshtein anymore
      return false;
    }

    // Get match type from the item if available (for typed results)
    const scoredItem = item as ScoredQuranText;
    const matchType = scoredItem.matchType || 'none';

    // Define match type indicator styles - using subtle bottom border
    const getMatchTypeColor = () => {
      switch (matchType) {
        case 'exact':
          return '#4CAF50'; // Green
        case 'lemma':
          return '#2196F3'; // Blue
        case 'root':
          return '#9C27B0'; // Purple
        case 'fuzzy':
          return '#FF9800'; // Orange
        default:
          return '#e5e7eb'; // Light gray
      }
    };

    return (
      <TouchableOpacity onPress={() => handlePress(item)}>
        {/* SEO meta tags */}
        <SEO
          title="البحث - المصحف المفتوح"
          description="البحث في آيات القرآن الكريم"
        />
        <ThemedView
          style={[
            styles.item,
            {
              borderBottomColor: tintColor,
              borderLeftWidth: 3,
              borderLeftColor: getMatchTypeColor(),
            },
          ]}
        >
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'flex-end',
              alignItems: 'center',
              width: '100%',
            }}
          >
            <Pressable
              onPress={() => {
                router.replace({
                  pathname: '/',
                  params: { page: item.page_id.toString(), temporary: 'true' },
                });
              }}
            >
              <ThemedText type="link">{`سورة: ${item.sura_name} - الآية: ${item.aya_id}`}</ThemedText>
            </Pressable>
          </View>
          <ThemedText type="default" style={styles.uthmani}>
            <HighlightText
              text={item.standard}
              tokens={directTokens}
              relatedWords={relatedTokens}
              fuzzyWords={fuzzyTokens}
              color="#FFEB3B"
              style={{ fontSize: 18 }}
            />
          </ThemedText>
        </ThemedView>
      </TouchableOpacity>
    );
  };

  if (isLoading)
    return (
      <ThemedView style={styles.container}>
        <ActivityIndicator size="large" color={tintColor} />
      </ThemedView>
    );

  if (error)
    return (
      <ThemedView style={styles.container}>
        <ThemedText type="defaultSemiBold">{`حدث خطأ: ${error}`}</ThemedText>
      </ThemedView>
    );

  const selectedLabels: string[] = [];
  if (advancedOptions.lemma) selectedLabels.push(`صيغة: ${counts.lemma}`);
  if (advancedOptions.root) selectedLabels.push(`جذر: ${counts.root}`);
  const counterText =
    query.trim() === ''
      ? ''
      : selectedLabels.length > 0
        ? `عدد النتائج: ${counts.total} (${selectedLabels.join('، ')})`
        : `عدد النتائج: ${counts.total} (نص)`;

  return (
    <ThemedView style={styles.container}>
      {query.trim() !== '' && counts.total > 0 && (
        <ThemedView style={styles.legendContainer}>
          <ThemedView style={styles.legendItem}>
            <ThemedView
              style={[styles.colorDot, { backgroundColor: '#4CAF50' }]}
            />
            <ThemedText style={styles.legendText}>نص</ThemedText>
          </ThemedView>
          <ThemedView style={styles.legendItem}>
            <ThemedView
              style={[styles.colorDot, { backgroundColor: '#2196F3' }]}
            />
            <ThemedText style={styles.legendText}>صيغة</ThemedText>
          </ThemedView>
          <ThemedView style={styles.legendItem}>
            <ThemedView
              style={[styles.colorDot, { backgroundColor: '#9C27B0' }]}
            />
            <ThemedText style={styles.legendText}>جذر</ThemedText>
          </ThemedView>
          <ThemedView style={styles.legendItem}>
            <ThemedView
              style={[styles.colorDot, { backgroundColor: '#FF9800' }]}
            />
            <ThemedText style={styles.legendText}>تقريبي</ThemedText>
          </ThemedView>
        </ThemedView>
      )}
      <ThemedView style={styles.searchContainer}>
        <ThemedTextInput
          variant="outlined"
          style={styles.searchInput}
          placeholder="البحث..."
          onChangeText={(text) => {
            const arabicOnly = text.replace(/[^\u0621-\u064A\s]/g, '');
            setInputText(arabicOnly);
            handleSearch(arabicOnly);
          }}
          value={inputText}
        />
        <Feather
          name="search"
          size={20}
          color={primaryColor}
          style={styles.icon}
        />

        <Pressable onPress={() => setShowOptions(!showOptions)}>
          <Ionicons
            name="options"
            size={20}
            color={showOptions ? primaryColor : '#777'}
            style={styles.icon}
          />
        </Pressable>
      </ThemedView>

      {showOptions && (
        <ThemedView style={styles.advancedOptions}>
          <View style={styles.optionRow}>
            <Pressable
              style={[
                styles.optionButton,
                advancedOptions.lemma && styles.optionActive,
              ]}
              onPress={() => toggleOption('lemma')}
            >
              <ThemedText
                style={
                  advancedOptions.lemma ? styles.optionActiveText : undefined
                }
              >
                الصيغة
              </ThemedText>
            </Pressable>

            <Pressable
              style={[
                styles.optionButton,
                advancedOptions.root && styles.optionActive,
              ]}
              onPress={() => toggleOption('root')}
            >
              <ThemedText
                style={
                  advancedOptions.root ? styles.optionActiveText : undefined
                }
              >
                الجذر
              </ThemedText>
            </Pressable>
          </View>
        </ThemedView>
      )}

      {query ? (
        <ThemedText style={styles.resultCount}>{counterText}</ThemedText>
      ) : null}

      <FlatList
        data={filteredResults}
        keyExtractor={(item) => item.gid.toString()}
        renderItem={renderItem}
        ListEmptyComponent={
          query ? (
            <ThemedView style={styles.emptyContainer}>
              <ThemedText type="default">لا توجد نتائج</ThemedText>
            </ThemedView>
          ) : null
        }
      />

      <TafseerPopup
        show={show}
        setShow={setShow}
        aya={selectedAya.aya}
        surah={selectedAya.surah}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 8,
    marginVertical: 4,
  },
  colorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  legendText: {
    fontSize: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 10,
    paddingHorizontal: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    textAlign: 'right',
    paddingVertical: 10,
  },
  icon: { marginHorizontal: 6 },
  item: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'center',
    gap: 5,
    padding: 15,
    marginHorizontal: 10,
    borderBottomWidth: 1,
  },
  uthmani: { paddingVertical: 10, fontFamily: 'Amiri_400Regular' },
  advancedOptions: {
    padding: 10,
    marginBottom: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
  },
  optionRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10 },
  optionButton: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  optionActive: { backgroundColor: '#e3f2fd', borderColor: '#1976d2' },
  optionActiveText: { color: '#1976d2', fontWeight: '600' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  resultCount: { textAlign: 'right', marginBottom: 6, fontSize: 14 },
});
