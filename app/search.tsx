import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet } from 'react-native';

import morphologyDataRaw from '@/assets/search/quran-morphology.json';
import wordMapJSON from '@/assets/search/word-map.json';
import {
  SearchAdvancedOptions,
  SearchColorLegend,
  SearchEmptyState,
  SearchInput,
  SearchResultItem,
  SearchSkeleton,
  Seo,
  TafseerPopup,
  ThemedText,
  ThemedView,
} from '@/components';
import {
  useColors,
  useDebounce,
  useQuranMetadata,
  useQuranSearch,
} from '@/hooks';
import { SearchOptions } from '@/types';

const MORPH = morphologyDataRaw;
const WORD_MAP = new Map(
  Object.entries(wordMapJSON),
) as import('quran-search-engine').WordMap;

export default function Search() {
  const { quranData, isLoading, error } = useQuranMetadata();
  const { tintColor, primaryColor, secondaryColor, dangerColor } = useColors();

  const PAGE_SIZE = 50;

  const [inputText, setInputText] = useState('');
  const [query, setQuery] = useState('');
  const [showOptions, setShowOptions] = useState(false);
  const [advancedOptions, setAdvancedOptions] = useState<SearchOptions>({
    lemma: false,
    root: false,
    fuzzy: false,
  });
  const [selectedAya, setSelectedAya] = useState({ aya: 0, surah: 0 });
  const [page, setPage] = useState(1);
  const [results, setResults] = useState<any[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isOptionChanging, setIsOptionChanging] = useState(false);

  const listRef = useRef<FlatList>(null);

  const handleSearch = useDebounce((text: string) => {
    setIsTyping(false);
    setPage(1);
    setHasMore(false);
    setQuery(text);
  }, 300);

  const { pageResults, counts } = useQuranSearch({
    quranData,
    morphologyData: MORPH,
    wordMap: WORD_MAP,
    query,
    advancedOptions,
    fuseInstance: null,
    page,
    limit: PAGE_SIZE,
  });

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setHasMore(false);
      setIsLoadingMore(false);
      setIsOptionChanging(false);
      return;
    }

    if (!pageResults) return;

    setResults((prev) => {
      if (page === 1) return pageResults;
      const existingIds = new Set(prev.map((r) => r.gid));
      const newItems = pageResults.filter((r) => !existingIds.has(r.gid));
      return [...prev, ...newItems];
    });

    const more = pageResults.length === PAGE_SIZE;
    setHasMore(more);
    setIsLoadingMore(false);
    setIsOptionChanging(false);

    if (page === 1 && listRef.current) {
      listRef.current.scrollToOffset({ offset: 0, animated: false });
    }
  }, [pageResults, page, query]);

  const toggleOption = (option: keyof SearchOptions) => {
    if (query.trim()) {
      setIsOptionChanging(true);
      setPage(1);
    }

    requestAnimationFrame(() => {
      setAdvancedOptions((prev) => ({ ...prev, [option]: !prev[option] }));
    });
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
        <ThemedText type="defaultSemiBold">{error}</ThemedText>
      </ThemedView>
    );

  const selectedLabels: string[] = [];
  if (advancedOptions.lemma) selectedLabels.push(`صيغة: ${counts.lemma}`);
  if (advancedOptions.root) selectedLabels.push(`جذر: ${counts.root}`);
  if (advancedOptions.fuzzy) selectedLabels.push(`تقريبي: ${counts.fuzzy}`);
  const counterText =
    query.trim() === ''
      ? ''
      : selectedLabels.length > 0
        ? `عدد النتائج: ${counts.total} (${selectedLabels.join('، ')})`
        : `عدد النتائج: ${counts.total} (نص)`;

  const isBusy = isTyping || isOptionChanging;
  const showNoResults =
    !isBusy &&
    !isLoading &&
    query.trim() !== '' &&
    pageResults !== undefined &&
    pageResults !== null &&
    results.length === 0 &&
    pageResults.length === 0;

  return (
    <ThemedView style={styles.container}>
      <SearchInput
        value={inputText}
        onChangeText={(text: string) => {
          const arabicOnly = text.replace(/[^\u0621-\u064A\s]/g, '');
          setInputText(arabicOnly);
          if (arabicOnly.trim()) {
            setIsTyping(true);
          } else {
            setIsTyping(false);
          }
          handleSearch(arabicOnly);
        }}
        isTyping={isTyping}
        isSearching={isBusy}
        showOptions={showOptions}
        setShowOptions={setShowOptions}
        primaryColor={primaryColor}
        secondaryColor={secondaryColor}
      />

      {showOptions && (
        <SearchAdvancedOptions
          advancedOptions={advancedOptions}
          toggleOption={toggleOption}
        />
      )}

      {query ? (
        <ThemedText style={styles.resultCount}>{counterText}</ThemedText>
      ) : null}

      <SearchColorLegend />

      {isBusy && results.length === 0 ? (
        <FlatList
          data={[1, 2, 3, 4, 5, 6]}
          keyExtractor={(item) => item.toString()}
          renderItem={() => <SearchSkeleton />}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <FlatList
          ref={listRef}
          data={results}
          style={{ opacity: isBusy && results.length > 0 ? 0.5 : 1 }}
          keyExtractor={(item) => item.gid.toString()}
          renderItem={({ item }) => (
            <SearchResultItem
              item={item}
              onSelectAya={(selected: { aya: number; surah: number }) =>
                setSelectedAya(selected)
              }
              disabled={isBusy && results.length > 0}
            />
          )}
          onEndReached={() => {
            if (!hasMore || isLoadingMore) return;
            setIsLoadingMore(true);
            setPage((prev) => prev + 1);
          }}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            isLoadingMore ? (
              <ThemedView style={{ paddingVertical: 12 }}>
                <ActivityIndicator size="small" color={tintColor} />
              </ThemedView>
            ) : null
          }
          ListEmptyComponent={
            !query.trim() && !inputText.trim() ? (
              <SearchEmptyState
                type="initial"
                primaryColor={primaryColor}
                dangerColor={dangerColor}
              />
            ) : showNoResults ? (
              <SearchEmptyState
                type="no-results"
                primaryColor={primaryColor}
                dangerColor={dangerColor}
              />
            ) : null
          }
        />
      )}

      <TafseerPopup
        show={selectedAya.aya > 0}
        setShow={() => setSelectedAya({ aya: 0, surah: 0 })}
        aya={selectedAya.aya}
        surah={selectedAya.surah}
      />

      <Seo
        title="البحث - المصحف المفتوح"
        description="البحث في آيات القرآن الكريم"
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  resultCount: { textAlign: 'right', marginBottom: 6, fontSize: 14 },
});
