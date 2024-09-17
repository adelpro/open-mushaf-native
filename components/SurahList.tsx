import React from 'react';
import { StyleSheet } from 'react-native';

import { Chapter } from '@/types';

import ChapterCard from './ChapterCard';
import { ThemedView } from './ThemedView';
import chaptersJSON from '../assets/quran-metadata/mushaf-elmadina-warsh-azrak/surah.json';

export default function SurahsList() {
  // TODO: add flatlist
  return (
    <ThemedView style={styles.container}>
      {chaptersJSON.map((chapter: Chapter) => (
        <ChapterCard key={chapter.number} chapter={chapter} />
      ))}
    </ThemedView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    width: '100%',
  },
});
