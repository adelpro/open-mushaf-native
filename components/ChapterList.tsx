import React from 'react';
import { ActivityIndicator, StyleSheet } from 'react-native';

import { FlashList } from '@shopify/flash-list';

import { LIST_HORIZONTAL_SPACE } from '@/constants';
import { useColors, useQuranMetadata } from '@/hooks';
import { Chapter } from '@/types';

import { ChapterCard } from './ChapterCard';
import { ListItemSeparator } from './ListItemSeparator';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

const extractChapterKey = (item: Chapter) => item.number.toString();

const renderChapterItem = ({ item }: { item: Chapter }) => (
  <ChapterCard chapter={item} />
);

/**
 * A list component that fetches chapter metadata using the `useQuranMetadata` hook
 * and renders a sequence of `ChapterCard`s.
 * Displays local loading indicators and error states accordingly.
 *
 * @returns A rendered scrollable view or fallback state representing the list of chapters.
 */
export function ChapterList() {
  const { tintColor } = useColors();
  const { chapterData, isLoading, error } = useQuranMetadata();

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
      keyExtractor={extractChapterKey}
      data={chapterData}
      renderItem={renderChapterItem}
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
