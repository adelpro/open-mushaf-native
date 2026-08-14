import React from 'react';
import { ActivityIndicator, StyleSheet } from 'react-native';

import { FlashList } from '@shopify/flash-list';

import { LIST_HORIZONTAL_SPACE } from '@/constants';
import { useColors, useQuranMetadata } from '@/hooks';
import { Surah } from '@/types';

import { ListItemSeparator } from './ListItemSeparator';
import { SurahCard } from './SurahCard';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

const extractSurahKey = (item: Surah) => item.number.toString();

const renderSurahItem = ({ item }: { item: Surah }) => (
  <SurahCard surah={item} />
);

/**
 * Fetch and display all 114 Surahs within sequentially rendered `SurahCard` instances.
 * Internally handles application suspense/loading fallback behaviors during metadata fetch.
 *
 * @returns A structurally mapped list layout rendering the active catalog of Surahs.
 */
export function SurahList() {
  const { tintColor } = useColors();
  const { surahData, isLoading, error } = useQuranMetadata();

  if (isLoading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={tintColor} />
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={styles.errorContainer}>
        <ThemedText type="defaultSemiBold">{error}</ThemedText>
      </ThemedView>
    );
  }

  return (
    <FlashList
      contentContainerStyle={styles.contentContainer}
      keyExtractor={extractSurahKey}
      data={surahData}
      renderItem={renderSurahItem}
      ItemSeparatorComponent={ListItemSeparator}
    />
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  contentContainer: {
    paddingHorizontal: LIST_HORIZONTAL_SPACE,
  },
});
