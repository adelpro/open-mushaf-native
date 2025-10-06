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

  // stable token extractor — wrapped in useCallback to satisfy hooks lint
  const getPositiveTokens = useCallback(
    (
      verse: QuranText,
      mode: 'text' | 'lemma' | 'root',
      targetLemma?: string,
      targetRoot?: string,
      cleanQuery?: string,
    ): string[] => {
      try {
        if (mode === 'text') {
          if (!cleanQuery) return [];

          const normalizedQuery = normalizeArabic(cleanQuery);
          // simple find: split words and return those equal or containing query
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
          const matched = morph.lemmas.filter(
            (l) => normalizeArabic(l) === normTarget,
          );
          if (matched.length) return Array.from(new Set(matched));
          return Array.from(
            new Set(
              morph.lemmas.filter((l) =>
                normalizeArabic(l).includes(normTarget),
              ),
            ),
          );
        }

        if (mode === 'root' && targetRoot) {
          const normTarget = normalizeArabic(targetRoot);
          const matched = morph.roots.filter(
            (r) => normalizeArabic(r) === normTarget,
          );
          if (matched.length) return Array.from(new Set(matched));
          return Array.from(
            new Set(
              morph.roots.filter((r) =>
                normalizeArabic(r).includes(normTarget),
              ),
            ),
          );
        }

        return [];
      } catch {
        return [];
      }
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

    const useLemma = advancedOptions.lemma;
    const useRoot = advancedOptions.root;
    const isAdvanced = useLemma || useRoot;

    // per-type results
    const simpleMatches = simpleSearch(quranData, cleanQuery, 'standard');

    const lemmaMatches = useLemma
      ? performAdvancedLinguisticSearch(
          cleanQuery,
          quranData,
          { lemma: true, root: false },
          fuseInstance,
        )
      : [];

    const rootMatches = useRoot
      ? performAdvancedLinguisticSearch(
          cleanQuery,
          quranData,
          { lemma: false, root: true },
          fuseInstance,
        )
      : [];

    // unique combined results (preserve quranData order)
    const gidSet = new Set<number>();
    const combined: QuranText[] = [];
    const pushIfNew = (v: QuranText) => {
      if (!gidSet.has(v.gid)) {
        gidSet.add(v.gid);
        combined.push(v);
      }
    };

    for (const v of simpleMatches) pushIfNew(v);
    for (const v of lemmaMatches) pushIfNew(v);
    for (const v of rootMatches) pushIfNew(v);

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
    setFilteredResults(combined);

    // Logging with detail
    console.groupCollapsed(`🔍 Search Debug — "${cleanQuery}"`);
    console.log(
      'Mode:',
      isAdvanced
        ? `Advanced (lemma=${useLemma}, root=${useRoot})`
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
          ...getPositiveTokens(v, 'lemma', mappedLemma, undefined, cleanQuery),
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

    if (!mapEntry && (useLemma || useRoot)) {
      console.log(
        'Suggestion: add the query form to word-map.json to enable precise lemma/root matching.',
      );
    }

    console.groupEnd();
  }, [query, quranData, fuseInstance, advancedOptions, getPositiveTokens]);

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

  const renderItem = ({ item }: { item: QuranText }) => (
    <TouchableOpacity onPress={() => handlePress(item)}>
      <SEO
        title="البحث - المصحف المفتوح"
        description="البحث في آيات القرآن الكريم"
      />
      <ThemedView style={[styles.item, { borderBottomColor: tintColor }]}>
        <ThemedText type="default" style={styles.uthmani}>
          <HighlightText
            text={item.standard}
            query={query.trim()}
            color="#FFEB3B" // optional highlight color
            style={{ fontSize: 18 }}
          />
        </ThemedText>
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
      </ThemedView>
    </TouchableOpacity>
  );

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

  // Result label logic: show only selected types + total
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
      {/* Search Input */}
      <ThemedView style={styles.searchContainer}>
        <ThemedTextInput
          variant="outlined"
          style={styles.searchInput}
          placeholder="البحث..."
          onChangeText={(text) => {
            // keep only Arabic letters and spaces
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

      {/* Advanced Options */}
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

      {/* Results Count */}
      {query ? (
        <ThemedText style={styles.resultCount}>{counterText}</ThemedText>
      ) : null}

      {/* Results */}
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
