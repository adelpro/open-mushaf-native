import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';

import { useAtomValue } from 'jotai/react';

import morphologyDataRaw from '@/assets/search/quran-morphology.json';
import wordMapJSON from '@/assets/search/word-map.json';
import {
  SearchAdvancedOptions,
  SearchColorLegend,
  SearchEmptyState,
  SearchInput,
  SearchModeToggle,
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
  useHybridSearch,
  useQuranMetadata,
  useQuranSearch,
} from '@/hooks';
import { retryHybridEmbedder } from '@/hooks/useHybridSearch';
import { searchMode as searchModeAtom } from '@/jotai/atoms';
import { type QuranText, SearchOptions } from '@/types';

const MORPH = morphologyDataRaw;
const WORD_MAP = new Map(
  Object.entries(wordMapJSON),
) as import('quran-search-engine').WordMap;

export default function Search() {
  const { quranData, isLoading, error } = useQuranMetadata();
  const searchMode = useAtomValue(searchModeAtom);
  const { tintColor, primaryColor, secondaryColor, dangerColor } = useColors();

  const PAGE_SIZE = 50;

  const [inputText, setInputText] = useState('');
  const [query, setQuery] = useState('');
  const [showOptions, setShowOptions] = useState(false);
  const [advancedOptions, setAdvancedOptions] = useState<SearchOptions>({
    lemma: false,
    root: false,
    fuzzy: false,
    semantic: false,
    isRegex: false,
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

  // AI path — only active when the user picked the AI tab.
  const hybrid = useHybridSearch({ query });

  // Project hybrid results into QuranText so the existing SearchResultItem renders.
  const activeResults: QuranText[] = useMemo(() => {
    if (searchMode === 'ai') {
      const byGid = new Map<number, QuranText>();
      if (quranData) {
        for (const v of quranData) byGid.set(v.gid, v);
      }
      return hybrid.results.map((r) => {
        const original = byGid.get(r.gid);
        const isDense = r.sources.includes('dense');
        const isKeyword = r.sources.includes('keyword');
        const matchSource: 'keyword' | 'ai' | 'both' =
          isDense && isKeyword ? 'both' : isDense ? 'ai' : 'keyword';
        return {
          gid: r.gid,
          sura_id: r.sura_id,
          aya_id: r.aya_id,
          uthmani: r.text_uthmani,
          standard: r.text_clean,
          ...({
            tafseerSnippet: r.tafseer_snippet,
            matchSource,
          } as any),
          ...(original ?? {}),
        } as QuranText;
      });
    }
    return pageResults;
  }, [searchMode, hybrid.results, pageResults, quranData]);

  const totalCount = searchMode === 'ai' ? hybrid.total : counts.total || 0;
  const isAiLoading = searchMode === 'ai' && hybrid.isLoading;
  const aiDownloadProgress =
    searchMode === 'ai' ? hybrid.downloadProgress : null;
  const aiError = searchMode === 'ai' ? hybrid.error : null;
  const aiFailureReason = searchMode === 'ai' ? hybrid.failureReason : null;
  const aiUsedDense = searchMode === 'ai' ? hybrid.usedDense : false;

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setHasMore(false);
      setIsLoadingMore(false);
      setIsOptionChanging(false);
      return;
    }

    if (!activeResults) return;

    setResults((prev) => {
      if (page === 1) return activeResults;
      const existingIds = new Set(prev.map((r) => r.gid));
      const newItems = activeResults.filter((r) => !existingIds.has(r.gid));
      return [...prev, ...newItems];
    });

    const more = searchMode === 'keyword' && activeResults.length === PAGE_SIZE;
    setHasMore(more);
    setIsLoadingMore(false);
    setIsOptionChanging(false);

    if (page === 1 && listRef.current) {
      listRef.current.scrollToOffset({ offset: 0, animated: false });
    }
  }, [activeResults, page, query, searchMode]);

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
  if (advancedOptions.semantic)
    selectedLabels.push(`دلالي: ${(counts as any).semantic || 0}`);
  if (advancedOptions.isRegex) selectedLabels.push(`النمط (Regex)`);

  const counterText =
    query.trim() === ''
      ? ''
      : searchMode === 'ai'
        ? `عدد النتائج: ${totalCount} (بحث ذكي${aiUsedDense ? ' - دلالي' : ''})`
        : selectedLabels.length > 0
          ? `عدد النتائج: ${counts.total} (${selectedLabels.join('، ')})`
          : `عدد النتائج: ${counts.total} (نص)`;

  const isBusy = isTyping || isOptionChanging || isAiLoading;
  const showNoResults =
    !isBusy &&
    !isLoading &&
    query.trim() !== '' &&
    activeResults !== undefined &&
    activeResults !== null &&
    results.length === 0 &&
    activeResults.length === 0;

  return (
    <ThemedView style={styles.container}>
      <SearchInput
        value={inputText}
        onChangeText={(text: string) => {
          setInputText(text);
          if (text.trim()) {
            setIsTyping(true);
          } else {
            setIsTyping(false);
          }
          handleSearch(text);
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

      <SearchModeToggle tintColor={primaryColor} />

      {searchMode === 'ai' && aiDownloadProgress ? (
        <View style={styles.banner}>
          <ThemedText style={styles.bannerText}>
            {`جاري تنزيل نموذج الذكاء الاصطناعي… (${(
              aiDownloadProgress.bytesDownloaded /
              (1024 * 1024)
            ).toFixed(1)} MB)`}
          </ThemedText>
        </View>
      ) : null}

      {searchMode === 'ai' &&
      !isBusy &&
      !hybrid.isModelReady &&
      !aiDownloadProgress &&
      query.trim() ? (
        <View style={[styles.banner, styles.bannerWarn]}>
          <ThemedText style={styles.bannerText}>
            {aiFailureReason === 'tokenizer-missing'
              ? 'تعذّر تحميل النموذج: ملف tokenizer.json غير موجود في ذاكرة التطبيق. أعد فتح البحث الذكي للمحاولة مجدداً.'
              : aiFailureReason === 'download-failed'
                ? 'تعذّر تنزيل النموذج من الخادم. تحقق من الاتصال بالإنترنت ثم أعد المحاولة.'
                : aiFailureReason === 'opfs-failed'
                  ? 'تعذّر تهيئة التخزين المحلي في المتصفح. جرّب متصفّحاً آخر.'
                  : aiFailureReason === 'web-unsupported'
                    ? 'البحث الذكي غير متاح على إصدار الويب حالياً. يرجى استخدام التطبيق للحصول على البحث الذكي.'
                    : aiFailureReason === 'runtime-init'
                      ? 'تعذّر تهيئة نموذج الذكاء الاصطناعي على هذا الجهاز. سيتم استخدام البحث التقليدي.'
                      : aiError
                        ? `تعذّر تحميل نموذج الذكاء الاصطناعي: ${aiError}`
                        : 'البحث الدلالي غير جاهز بعد، يستخدم البحث التقليدي.'}
          </ThemedText>
          {aiFailureReason !== 'web-unsupported' ? (
            <Pressable
              style={styles.retryButton}
              onPress={() => {
                void retryHybridEmbedder();
                setQuery((q) => `${q} `);
                setInputText((t) => `${t} `);
              }}
              accessibilityRole="button"
              accessibilityLabel="إعادة محاولة تحميل نموذج الذكاء الاصطناعي"
            >
              <ThemedText style={styles.retryText}>إعادة المحاولة</ThemedText>
            </Pressable>
          ) : null}
        </View>
      ) : null}

      {query ? (
        <ThemedText style={styles.resultCount}>{counterText}</ThemedText>
      ) : null}

      {(counts as any)?.range &&
      (counts as any).range > 0 &&
      results.length > 0 ? (
        <ThemedView
          style={{
            backgroundColor: '#e8f5e9',
            padding: 12,
            borderRadius: 8,
            marginBottom: 10,
            borderColor: '#4caf50',
            borderWidth: 1,
          }}
        >
          <ThemedText
            style={{
              textAlign: 'center',
              color: '#2e7d32',
              fontWeight: 'bold',
            }}
          >
            بحث بالنطاق: تم العثور على {(counts as any).range} آية.
            {'\n'}يمكنك الضغط على أي من النتائج أسفله للانتقال مباشرة للآية.
          </ThemedText>
        </ThemedView>
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
          renderItem={({ item }) => {
            const aiProps = (item as any).tafseerSnippet
              ? {
                  matchSource: (item as any).matchSource ?? 'ai',
                  tafseerSnippet: (item as any).tafseerSnippet,
                }
              : {};
            return (
              <SearchResultItem
                item={item}
                onSelectAya={(selected: { aya: number; surah: number }) =>
                  setSelectedAya(selected)
                }
                disabled={isBusy && results.length > 0}
                {...aiProps}
              />
            );
          }}
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
  banner: {
    backgroundColor: '#E0F2F1',
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
    borderColor: '#26A69A',
    borderWidth: 1,
  },
  bannerWarn: {
    backgroundColor: '#FFF3E0',
    borderColor: '#FFB74D',
  },
  bannerText: {
    color: '#004D40',
    fontSize: 13,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 6,
    alignSelf: 'center',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FFB74D',
    backgroundColor: '#FFFFFF',
  },
  retryText: {
    color: '#E65100',
    fontSize: 12,
    fontWeight: '600',
  },
});
