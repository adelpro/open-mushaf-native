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
    alignSelf: 'center',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: 5,
    width: '100%',
    height: '100%',
    //maxWidth: 430,
    rowGap: 10,
    paddingHorizontal: 10,
  },
});
