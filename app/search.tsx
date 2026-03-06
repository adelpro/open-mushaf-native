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
import {
  SearchColorLegend,
  SearchResultItem,
  SearchSkeleton,
  Seo,
  TafseerPopup,
  ThemedText,
  ThemedTextInput,
  ThemedView,
} from '@/components';
import {
  useColors,
  useDebounce,
  useQuranMetadata,
  useQuranSearch,
} from '@/hooks';

const MORPH = morphologyDataRaw;
const WORD_MAP = wordMapJSON;

export default function Search() {
  const { quranData, isLoading, error } = useQuranMetadata();
  const { tintColor, primaryColor, secondaryColor, dangerColor } = useColors();

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
  const [isTyping, setIsTyping] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const listRef = useRef<FlatList>(null);

  const handleSearch = useDebounce((text: string) => {
    setIsTyping(false);
    setPage(1);
    setHasMore(false);
    setQuery(text);
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

  const toggleOption = (option: keyof typeof advancedOptions) => {
    if (query.trim()) {
      setIsSearching(true);
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
          cursorColor={secondaryColor}
          onChangeText={(text) => {
            const arabicOnly = text.replace(/[^\u0621-\u064A\s]/g, '');
            setInputText(arabicOnly);
            if (arabicOnly.trim()) {
              setIsTyping(true);
              setIsSearching(true);
            } else {
              setIsTyping(false);
              setIsSearching(false);
            }
            handleSearch(arabicOnly);
          }}
        />
        {isTyping || isSearching ? (
          <ActivityIndicator
            size="small"
            color={primaryColor}
            style={styles.icon}
          />
        ) : (
          <Feather
            name="search"
            size={20}
            color={primaryColor}
            style={styles.icon}
          />
        )}
        <Pressable
          onPress={() => setShowOptions(!showOptions)}
          accessibilityRole="button"
          accessibilityLabel="خيارات البحث المتقدم"
          accessibilityState={{ expanded: showOptions }}
        >
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
              accessibilityRole="togglebutton"
              accessibilityState={{ checked: advancedOptions.lemma }}
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
              accessibilityRole="togglebutton"
              accessibilityState={{ checked: advancedOptions.root }}
            >
              <ThemedText
                style={
                  advancedOptions.root ? styles.optionActiveText : undefined
                }
              >
                الجذر
              </ThemedText>
            </Pressable>
            <Pressable
              style={[
                styles.optionButton,
                advancedOptions.fuzzy && styles.optionActive,
              ]}
              onPress={() => toggleOption('fuzzy')}
              accessibilityRole="togglebutton"
              accessibilityState={{ checked: advancedOptions.fuzzy }}
            >
              <ThemedText
                style={
                  advancedOptions.fuzzy ? styles.optionActiveText : undefined
                }
              >
                التقريب
              </ThemedText>
            </Pressable>
          </View>
        </ThemedView>
      )}

      {query ? (
        <ThemedText style={styles.resultCount}>{counterText}</ThemedText>
      ) : null}

      <SearchColorLegend />

      {(isTyping || isSearching) && results.length === 0 ? (
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
          style={{
            opacity: (isTyping || isSearching) && results.length > 0 ? 0.5 : 1,
          }}
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
              disabled={(isTyping || isSearching) && results.length > 0}
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
            // 1) Initial empty state when there isn't any query
            !query.trim() && !inputText.trim() ? (
              <ThemedView style={styles.emptyContainer}>
                <ThemedView
                  style={[
                    styles.emptyIconWrapper,
                    { backgroundColor: primaryColor },
                  ]}
                >
                  <Ionicons name="book-outline" size={40} color="#fff" />
                </ThemedView>
                <ThemedText type="defaultSemiBold" style={styles.emptyTitle}>
                  ابحث في القرآن الكريم
                </ThemedText>
                <ThemedText style={styles.emptySubtitle}>
                  أدخل كلمة عربية للبحث عنها في آيات القرآن الكريم.
                </ThemedText>
              </ThemedView>
            ) : // 2) Hide empty states completely while we are waiting/searching to prevent flashing
            isTyping || isSearching || isLoading ? null : query.trim() && // 3) Only show "No Results" if we finished searching and actually found nothing
              results.length === 0 ? (
              <ThemedView style={styles.emptyContainer}>
                <ThemedView
                  style={[
                    styles.emptyIconWrapper,
                    { backgroundColor: dangerColor },
                  ]}
                >
                  <Ionicons
                    name="alert-circle-outline"
                    size={40}
                    color="#fff"
                  />
                </ThemedView>
                <ThemedText type="defaultSemiBold" style={styles.emptyTitle}>
                  لم يتم العثور على نتائج
                </ThemedText>
                <ThemedText style={styles.emptySubtitle}>
                  تأكد من كتابة الكلمة بشكل صحيح، أو جرّب كلمة أخرى.
                </ThemedText>
              </ThemedView>
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
    borderWidth: 0,
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginTop: 64,
  },
  emptyIconWrapper: {
    width: 84,
    height: 84,
    borderRadius: 42,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    marginBottom: 6,
    textAlign: 'center',
  },
  emptySubtitle: {
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 22,
    opacity: 0.8,
  },
  resultCount: { textAlign: 'right', marginBottom: 6, fontSize: 14 },
});
