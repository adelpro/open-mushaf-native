import React from 'react';
import { FlatList, StyleSheet } from 'react-native';

import { Chapter } from '@/types';

import ChapterCard from './ChapterCard';
import { ThemedView } from './ThemedView';
import chaptersJSON from '../assets/quran-metadata/mushaf-elmadina-warsh-azrak/chapter.json';

const ChapterList = () => {
  // Render function for FlatList items
  const renderItem = ({ item }: { item: Chapter }) => (
    <ChapterCard chapter={item} />
  );

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={chaptersJSON}
        keyExtractor={(item) => item.number.toString()} // Use chapter number as key
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

export default ChapterList;
