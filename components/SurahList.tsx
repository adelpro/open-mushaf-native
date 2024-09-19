import React from 'react';
import { StyleSheet } from 'react-native';

import { Chapter } from '@/types';

import SurahCard from './SurahCard';
import { ThemedView } from './ThemedView';
import surahsJSON from '../assets/quran-metadata/mushaf-elmadina-warsh-azrak/surah.json';

export default function SurahsList() {
  return (
    <ThemedView style={styles.container}>
      {surahsJSON.map((surah: Chapter) => (
        <SurahCard key={surah.number} surah={surah} />
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
