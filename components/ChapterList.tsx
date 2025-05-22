import React from 'react';
import { ActivityIndicator, StyleSheet } from 'react-native';

import { useColors } from '@/hooks/useColors';
import useQuranMetadata from '@/hooks/useQuranMetadata';

import ChapterCard from './ChapterCard';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

export default function ChapterList() {
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
