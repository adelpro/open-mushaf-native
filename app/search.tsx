import React, { useEffect, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import quranJson from '@/assets/quran-metadata/mushaf-elmadina-warsh-azrak/quran.json';
import TafseerPopup from '@/components/TafseerPopup';
import { ThemedTextInput } from '@/components/ThemedInput';
import { ThemedSafeAreaView } from '@/components/ThemedSafeAreaView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useColors } from '@/hooks/useColors';
import useDebounce from '@/hooks/useDebounce';
import { QuranText } from '@/types';

export default function Search() {
  const quranText: QuranText[] = quranJson as QuranText[];
  const [query, setQuery] = useState('');
  const [inputText, setInputText] = useState('');
  const [filteredResults, setFilteredResults] = useState<QuranText[]>([]);
  const [show, setShow] = useState(false);
  const { iconColor, tintColor, primaryColor } = useColors();
  const handleSearch = useDebounce((text: string) => {
    setQuery(text);
  }, 200);
  const [selectedAya, setSelectedAya] = useState({ aya: 0, surah: 0 });

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

  const handlePress = (aya: QuranText) => {
    setSelectedAya({ aya: aya.aya_id, surah: aya.sura_id });
    setShow(true);
  };

  const renderItem = ({ item }: { item: QuranText }) => (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={`فتح تفسير للآية ${item.aya_id} من سورة ${item.sura_name}`}
      accessibilityHint="سيظهر نافذة تحتوي على تفسير الآية"
      onPress={() => handlePress(item)}
    >
      <ThemedView style={[styles.item, { borderBottomColor: tintColor }]}>
        <ThemedText type="default" style={styles.uthmani}>
          {item.uthmani}
        </ThemedText>
        <Pressable
          accessibilityRole="link"
          accessibilityLabel={`انتقال إلى الصفحة ${item.page_id}`}
          onPress={() => {
            router.replace({
              pathname: '/',
              params: { page: item.page_id.toString(), temporary: 'true' },
            });
          }}
        >
          <ThemedText type="link">
            {`سورة: ${item.sura_name} - الآية: ${item.aya_id}`}
          </ThemedText>
        </Pressable>
      </ThemedView>
    </TouchableOpacity>
  );

  return (
    <ThemedSafeAreaView style={styles.container}>
      {/* Search Input */}
      <ThemedView style={styles.searchContainer}>
        <ThemedTextInput
          variant="outlined"
          style={[styles.searchInput]}
          placeholder="البحث..."
          onChangeText={(text) => {
            setInputText(text);
            handleSearch(text);
          }}
          value={inputText}
          accessibilityRole="search"
        />
        <Ionicons
          name="search"
          size={20}
          color={iconColor}
          style={[styles.icon, { color: primaryColor }]}
        />
      </ThemedView>

      {/* FlatList for search results */}
      <FlatList
        data={filteredResults}
        keyExtractor={(item) => item.gid.toString()}
        renderItem={renderItem}
        ListEmptyComponent={
          query ? <ThemedText type="default">لا توجد نتائج</ThemedText> : null
        }
        accessibilityRole="list"
        accessibilityLabel="نتائج البحث"
      />
      <TafseerPopup
        show={show}
        setShow={setShow}
        aya={selectedAya.aya}
        surah={selectedAya.surah}
      />
    </ThemedSafeAreaView>
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
    borderBottomWidth: 1,
  },
  uthmani: {
    paddingVertical: 10,
    fontFamily: 'Amiri_400Regular',
  },
});
