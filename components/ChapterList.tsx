import React from 'react';
import { StyleSheet } from 'react-native';

import { Chapter } from '@/types';

import ChapterCard from './ChapterCard';
import { ThemedView } from './ThemedView';
import chaptersJSON from '../assets/quran-metadata/mushaf-elmadina-warsh-azrak/chapter.json';

export default function ChapterList() {
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
    alignSelf: 'center',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: 5,
    width: '100%',
    height: '100%',
    maxWidth: 430,
    rowGap: 10,
    paddingHorizontal: 10,
  },
});
