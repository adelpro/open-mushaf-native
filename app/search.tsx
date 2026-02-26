import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';

import { Feather, Ionicons } from '@expo/vector-icons';

import morphologyDataRaw from '@/assets/search/quran-morphology.json';
import wordMapJSON from '@/assets/search/word-map.json';
import SearchColorLegend from '@/components/searchColorLegend';
import SearchResultItem from '@/components/searchResultItem';
import SEO from '@/components/seo';
import TafseerPopup from '@/components/TafseerPopup';
import { ThemedTextInput } from '@/components/ThemedInput';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useColors } from '@/hooks/useColors';
import useDebounce from '@/hooks/useDebounce';
import useQuranMetadata from '@/hooks/useQuranMetadata';
import useQuranSearch from '@/hooks/useQuranSearch';

const MORPH = morphologyDataRaw;
const WORD_MAP = wordMapJSON;

// Constant lookup for advanced search option labels
const OPTION_LABELS: Record<'lemma' | 'root' | 'fuzzy', string> = {
  lemma: 'الصيغة',
  root: 'الجذر',
  fuzzy: 'التقريب',
};

export default function Search() {
  const { quranData, isLoading, error } = useQuranMetadata();
  const { tintColor, primaryColor } = useColors();

  const PAGE_SIZE = 50;

  const [inputText, setInputText] = useState('');
  const [query, setQuery] = useState('');
  const [showOptions, setShowOptions] = useState(false);
  const [advancedOptions, setAdvancedOptions] = useState({
    lemma: false,
    root: false,
    fuzzy: false,
  });
  const [selectedAya, setSelectedAya] = useState({ aya: 0, surah: 0 });
  const [page, setPage] = useState(1);
  const [results, setResults] = useState<any[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const listRef = useRef<FlatList>(null);

  const handleSearch = useDebounce((text: string) => {
    setPage(1);
    setResults([]);
    setHasMore(false);
    setQuery(text);
    // Note: isSearching is toggled off in the useEffect once results are fetched
  }, 300);

  const { pageResults, counts, getPositiveTokens } = useQuranSearch({
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
      setIsSearching(false);
      return;
    }

    if (!pageResults) return;

    setResults((prev) =>
      page === 1 ? pageResults : [...prev, ...pageResults],
    );

    const more = pageResults.length === PAGE_SIZE;
    setHasMore(more);
    setIsLoadingMore(false);
    setIsSearching(false);

    if (page === 1 && listRef.current) {
      listRef.current.scrollToOffset({ offset: 0, animated: false });
    }
  }, [pageResults, page, query]);

  /** Toggles the specified advanced search option on/off */
  const handleToggleOption = (option: keyof typeof advancedOptions) => {
    setAdvancedOptions((prev) => ({ ...prev, [option]: !prev[option] }));
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
  if (advancedOptions.fuzzy) selectedLabels.push(`تقريبي: ${counts.fuzzy}`);

  const counterText =
    query.trim() === ''
      ? ''
      : selectedLabels.length > 0
        ? `عدد النتائج: ${counts.total} (${selectedLabels.join('، ')})`
        : `عدد النتائج: ${counts.total} (نص)`;

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.searchContainer}>
        <ThemedTextInput
          variant="outlined"
          style={styles.searchInput}
          placeholder="البحث..."
          value={inputText}
          onChangeText={(text) => {
            const arabicOnly = text.replace(/[^\u0621-\u064A\s]/g, '');
            setInputText(arabicOnly);
            
            // Perceived performance: trigger searching UI immediately
            if (arabicOnly.trim().length > 0) {
              setIsSearching(true);
            } else {
              setIsSearching(false);
            }
            
            handleSearch(arabicOnly);
          }}
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
            {(['lemma', 'root', 'fuzzy'] as const).map((opt) => (
              <Pressable
                key={opt}
                style={[
                  styles.optionButton,
                  advancedOptions[opt] && styles.optionActive,
                ]}
                onPress={() => handleToggleOption(opt)}
              >
                <ThemedText
                  style={
                    advancedOptions[opt]
                      ? styles.optionActiveText
                      : undefined
                  }
                >
                  {OPTION_LABELS[opt]}
                </ThemedText>
              </Pressable>
            ))}
          </View>
        </ThemedView>
      )}

      {query && !isSearching ? (
        <ThemedText style={styles.resultCount}>{counterText}</ThemedText>
      ) : null}

      <SearchColorLegend />

      {/* Display Skeleton loaders during active search */}
      {isSearching && (
        <ThemedView style={styles.skeletonContainer}>
          {[1, 2, 3, 4].map((item) => (
            <View key={item} style={styles.skeletonCard} />
          ))}
        </ThemedView>
      )}

      <FlatList
        ref={listRef}
        // Hide actual list data during initial search to show skeletons clearly
        data={isSearching ? [] : results}
        keyExtractor={(item) => item.gid.toString()}
        renderItem={({ item }) => (
          <SearchResultItem
            item={item}
            query={query}
            advancedOptions={advancedOptions}
            wordMap={WORD_MAP}
            getPositiveTokens={getPositiveTokens}
            onSelectAya={(selected: { aya: number; surah: number }) =>
              setSelectedAya(selected)
            }
          />
        )}
        onEndReached={() => {
          if (!hasMore || isLoadingMore || isSearching) return;
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
          query && !isSearching ? (
            <ThemedView style={styles.emptyContainer}>
              <ThemedText type="default">لا توجد نتائج</ThemedText>
            </ThemedView>
          ) : null
        }
      />

      <TafseerPopup
        show={selectedAya.aya > 0}
        setShow={() => setSelectedAya({ aya: 0, surah: 0 })}
        aya={selectedAya.aya}
        surah={selectedAya.surah}
      />

      <SEO
        title="البحث - المصحف المفتوح"
        description="البحث في آيات القرآن الكريم"
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
  advancedOptions: {
    padding: 10,
    marginBottom: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
  },
  optionRow: { flexDirection: 'row', justifyContent: 'center', gap: 10 },
  optionButton: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  optionActive: { backgroundColor: '#e3f2fd', borderColor: '#1976d2' },
  optionActiveText: { color: '#1976d2', fontWeight: '600' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 40 },
  resultCount: { textAlign: 'right', marginBottom: 6, fontSize: 14, opacity: 0.7 },
  skeletonContainer: { paddingVertical: 12 },
  skeletonCard: {
    height: 80,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    marginBottom: 12,
    width: '100%',
    borderWidth: 1,
    borderColor: '#ececec',
  },
});
