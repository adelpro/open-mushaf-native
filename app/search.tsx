import React, { useEffect, useState } from 'react';
import {
  FlatList,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import quranJson from '@/assets/quran-metadata/mushaf-elmadina-warsh-azrak/quran.json';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import useDebounce from '@/hooks/useDebounce';
import { QuranText } from '@/types';

export default function Search() {
  const quranText: QuranText[] = quranJson as QuranText[];
  const [query, setQuery] = useState('');
  const [filteredResults, setFilteredResults] = useState<QuranText[]>([]);

  const handleSearch = useDebounce((text: string) => {
    setQuery(text);
  }, 300);

  useEffect(() => {
    if (!quranText || quranText.length === 0) return;

    if (query.trim() === '') {
      setFilteredResults([]);
      return;
    }

    const filtered = quranText.filter((item) =>
      item.standard.toLowerCase().includes(query.toLowerCase()),
    );
    setFilteredResults(filtered);
  }, [query, quranText]);

  const handlePress = (page: number) => {
    router.replace({
      pathname: '/',
      params: { page },
    });
  };

  const renderItem = ({ item }: { item: QuranText }) => (
    <TouchableOpacity onPress={() => handlePress(item.page_id)}>
      <ThemedView style={styles.item}>
        <ThemedText type="default">{item.uthmani}</ThemedText>
        <ThemedText type="default">
          {`سورة: ${item.sura_name} - الآية: ${item.aya_id}`}
        </ThemedText>
      </ThemedView>
    </TouchableOpacity>
  );

  return (
    <ThemedView style={styles.container}>
      {/* Search Input */}
      <ThemedView style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="البحث..."
          onChangeText={handleSearch}
          value={query}
          placeholderTextColor="#999"
        />
        <Ionicons name="search" size={20} color="gray" style={styles.icon} />
      </ThemedView>

      {/* FlatList for search results */}
      <FlatList
        data={filteredResults}
        keyExtractor={(item) => item.gid.toString()}
        renderItem={renderItem}
        ListEmptyComponent={
          query ? <ThemedText type="default">لا توجد نتائج</ThemedText> : null
        }
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'flex-start',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 20,
    alignSelf: 'center',
    maxWidth: 800,
    width: '100%',
  },
  searchInput: {
    flex: 1,
    padding: 10,
    fontSize: 16,
    color: '#333',
    textAlign: 'right',
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
    paddingLeft: 8,
  },
  icon: {
    margin: 8,
  },
  item: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'center',
    gap: 5,
    padding: 15,
    marginHorizontal: 10,
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
  },
});
