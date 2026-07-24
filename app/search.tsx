/**
 * Online-only Quran search backed by qurani.ai's `/search`
 * endpoint.
 *
 * Inputs are debounced by the caller (we just mirror state into
 * `query`). Results stream in from `useQuranSearch`, which handles
 * the network fetch + abort when the input changes. Offline state
 * shows an explicit retry CTA — search isn't cached locally in this
 * phase (no morphology download).
 */

import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet } from 'react-native';

import { Feather } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import { useAtomValue } from 'jotai/react';

import { Seo, TafseerPopup, ThemedText, ThemedView } from '@/components';
import { SearchEmptyState } from '@/components/SearchEmptyState';
import { SearchInput } from '@/components/SearchInput';
import { SearchResultItem } from '@/components/searchResultItem';
import { SearchSkeleton } from '@/components/SearchSkeleton';
import {
  useColors,
  useDebounce,
  useQuranSearch,
  useRiwayaCache,
} from '@/hooks';
import { firstLaunchDone } from '@/jotai/atoms';

const PAGE_SIZE = 50;

export default function Search() {
  const { tintColor, primaryColor, secondaryColor, dangerColor } = useColors();
  const firstLaunchDoneValue = useAtomValue(firstLaunchDone);
  const cache = useRiwayaCache();
  const layoutNumberByGid = cache.layoutNumberByGid;

  const [inputText, setInputText] = useState('');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [selectedAya, setSelectedAya] = useState<{
    gid: number;
    surah: number;
    layoutAyah: number;
  } | null>(null);

  const handleSearch = useDebounce((text: string) => {
    setPage(1);
    setQuery(text);
  }, 350);

  const onChangeText = useCallback(
    (text: string) => {
      setInputText(text);
      handleSearch(text);
    },
    [handleSearch],
  );

  // Reset to page 1 when query changes.
  useEffect(() => {
    setPage(1);
  }, [query]);

  const { results, totalCount, isLoading, error, reload } = useQuranSearch({
    query,
    page,
    limit: PAGE_SIZE,
  });

  const handleSelectAya = useCallback(
    (selected: { gid: number; surah: number; numberInSurah: number }) => {
      // Resolve to per-narration layoutAyah so the popup renders the
      // number that matches the user's chosen riwaya.
      const nIS = layoutNumberByGid.get(selected.gid) ?? selected.numberInSurah;
      setSelectedAya({
        gid: selected.gid,
        surah: selected.surah,
        layoutAyah: nIS,
      });
    },
    [layoutNumberByGid],
  );

  // Block access until the wizard is done.
  if (!firstLaunchDoneValue) {
    return (
      <ThemedView style={styles.center}>
        <ThemedText>اختر رواية أولاً من شاشة الإعداد</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen
        options={{
          title: 'بحث',
          headerTitleStyle: { fontFamily: 'Tajawal_400Regular' },
        }}
      />
      <Seo
        title="البحث - المصحف المفتوح"
        description="البحث في آيات القرآن الكريم"
      />

      <SearchInput
        value={inputText}
        onChangeText={onChangeText}
        isTyping={isLoading && results.length === 0}
        isSearching={isLoading}
        showOptions={false}
        setShowOptions={() => {
          /* options UI is Phase 5-follow-up */
        }}
        primaryColor={primaryColor}
        secondaryColor={secondaryColor}
      />

      {query ? (
        <ThemedText style={styles.countLine}>
          عدد النتائج: {totalCount} عبر الإنترنت
        </ThemedText>
      ) : null}

      {error ? (
        <ThemedView
          style={[styles.errorCard, { borderColor: dangerColor + '88' }]}
        >
          <Feather name="alert-circle" size={18} color={dangerColor} />
          <ThemedText style={[styles.errorText, { color: dangerColor }]}>
            {error}
          </ThemedText>
          <ThemedText style={styles.retryLink} onPress={reload}>
            إعادة المحاولة
          </ThemedText>
        </ThemedView>
      ) : null}

      {isLoading && results.length === 0 ? (
        <FlatList
          data={[1, 2, 3, 4, 5, 6]}
          keyExtractor={(item) => item.toString()}
          renderItem={() => <SearchSkeleton />}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item.number.toString()}
          renderItem={({ item }) => (
            <SearchResultItem
              item={item}
              onSelectAya={handleSelectAya}
              disabled={isLoading}
            />
          )}
          onEndReached={() => {
            if (isLoading) return;
            if (results.length >= totalCount) return;
            setPage((p) => p + 1);
          }}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            isLoading ? (
              <ThemedView style={{ paddingVertical: 12 }}>
                <ActivityIndicator size="small" color={tintColor} />
              </ThemedView>
            ) : null
          }
          ListEmptyComponent={
            query.trim() && !isLoading ? (
              <SearchEmptyState
                type="no-results"
                primaryColor={primaryColor}
                dangerColor={dangerColor}
              />
            ) : null
          }
        />
      )}

      {selectedAya ? (
        <TafseerPopup
          show
          setShow={() => setSelectedAya(null)}
          gid={selectedAya.gid}
          surah={selectedAya.surah}
          layoutAyah={selectedAya.layoutAyah}
        />
      ) : null}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    gap: 12,
  },
  center: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countLine: {
    fontSize: 13,
    opacity: 0.7,
    marginBottom: 4,
  },
  errorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 8,
  },
  errorText: {
    flex: 1,
    fontSize: 13,
  },
  retryLink: {
    fontSize: 13,
    textDecorationLine: 'underline',
    opacity: 0.8,
  },
});
