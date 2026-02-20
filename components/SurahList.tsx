import React from 'react';
import { ActivityIndicator, StyleSheet } from 'react-native';

import { ERROR_WITH_DETAILS } from '@/constants/errorMessages';
import { useColors, useQuranMetadata } from '@/hooks';

import { SurahCard } from './SurahCard';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

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
        <ThemedText type="defaultSemiBold">{ERROR_WITH_DETAILS(error)}</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      {surahData.map((surah) => (
        <SurahCard key={surah.number} surah={surah} />
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
