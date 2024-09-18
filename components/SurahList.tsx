import React from 'react';
import { FlatList, StyleSheet } from 'react-native';

import { Surah } from '@/types';

import SurahCard from './SurahCard';
import { ThemedView } from './ThemedView';
import surahsJSON from '../assets/quran-metadata/mushaf-elmadina-warsh-azrak/chapter.json';

const SurahList = () => {
  // Render function for FlatList items
  const renderItem = ({ item }: { item: Surah }) => <SurahCard surah={item} />;

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={surahsJSON}
        keyExtractor={(item) => item.number.toString()} // Use surah number as key
        renderItem={renderItem}
        contentContainerStyle={styles.flatListContent} // Optional: to add padding or styling
      />
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    width: '100%',
  },
  flatListContent: {
    // Optional: Add styles for FlatList content container
  },
});

export default SurahList;
