import React, { useMemo, useState } from 'react';
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
import SearchColorLegend from '@/components/search-color-legend';
import SearchResultItem from '@/components/search-result-item';
import SEO from '@/components/seo';
import TafseerPopup from '@/components/TafseerPopup';
import { ThemedTextInput } from '@/components/ThemedInput';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useColors } from '@/hooks/use-colors';
import useDebounce from '@/hooks/use-debounce';
import useQuranMetadata from '@/hooks/use-quran-metadata';
import useQuranSearch from '@/hooks/use-quran-search';
import { createArabicFuseSearch } from '@/utils/search-utils';

const MORPH = morphologyDataRaw;
const WORD_MAP = wordMapJSON;

export default function Search() {
  const { quranData, isLoading, error } = useQuranMetadata();
  const { tintColor, primaryColor } = useColors();

  const [inputText, setInputText] = useState('');
  const [query, setQuery] = useState('');
  const [showOptions, setShowOptions] = useState(false);
  const [advancedOptions, setAdvancedOptions] = useState({
    lemma: false,
    root: false,
  });
  const [selectedAya, setSelectedAya] = useState({ aya: 0, surah: 0 });

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

  const handleSearch = useDebounce((text: string) => setQuery(text), 200);

  const { filteredResults, counts, getPositiveTokens } = useQuranSearch({
    quranData,
    morphologyData: MORPH,
    wordMap: WORD_MAP,
    query,
    advancedOptions,
    fuseInstance,
  });

  const toggleOption = (option: keyof typeof advancedOptions) => {
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

      <SearchColorLegend />
      <FlatList
        data={filteredResults}
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
        ListEmptyComponent={
          query ? (
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
