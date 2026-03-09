import React from 'react';
import { ActivityIndicator, StyleSheet } from 'react-native';

import { useColors, useQuranMetadata } from '@/hooks';

import { ChapterCard } from './ChapterCard';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

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
        <ThemedText type="defaultSemiBold">{`حدث خطأ: ${error}`}</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      {chapterData.map((chapter) => (
        <ChapterCard key={chapter.number} chapter={chapter} />
      ))}
    </ThemedView>
  );
}
const styles = StyleSheet.create({
  container: {
    alignSelf: 'center',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: 5,
    width: '100%',
    height: '100%',
    rowGap: 10,
    paddingHorizontal: 10,
  },
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
});
