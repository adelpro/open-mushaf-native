import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAtom } from 'jotai/react';

import AdvancedSearchSVG from '@/assets/svgs/search-advanced.svg';
import SEO from '@/components/seo';
import TafseerPopup from '@/components/TafseerPopup';
import { ThemedTextInput } from '@/components/ThemedInput';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useColors } from '@/hooks/useColors';
import useDebounce from '@/hooks/useDebounce';
import useQuranMetadata from '@/hooks/useQuranMetadata';
import { advancedSearch } from '@/jotai/atoms';
import { QuranText } from '@/types';
import {
  createArabicFuseSearch,
  performAdvancedSearch,
  simpleSearch,
} from '@/utils/searchUtils';

export default function Search() {
  const { quranData, isLoading, error } = useQuranMetadata();
  const [query, setQuery] = useState('');
  const [inputText, setInputText] = useState('');
  const [filteredResults, setFilteredResults] = useState<QuranText[]>([]);
  const [show, setShow] = useState(false);

  const { iconColor, tintColor, primaryColor } = useColors();

  const [fuseInstance] = useState(() =>
    quranData
      ? createArabicFuseSearch(quranData, ['standard'], {
          // Higher threshold to catch more typos
          threshold: 0.2,
          minMatchCharLength: 2,
        })
      : null,
  );

  const [advancedSearchValue, setAdvancedSearchValue] = useAtom(advancedSearch);

  const handleSearch = useDebounce((text: string) => {
    setQuery(text);
  }, 200);

  const [selectedAya, setSelectedAya] = useState({ aya: 0, surah: 0 });

  useEffect(() => {
    if (!quranData || quranData.length === 0 || !fuseInstance) return;

    if (query.trim() === '') {
      setFilteredResults([]);
      return;
    }

    // In your useEffect where you perform the search:
    if (advancedSearchValue) {
      setFilteredResults(
        performAdvancedSearch(fuseInstance, query, ['standard'], quranData),
      );
    } else {
      // Use simple search
      setFilteredResults(simpleSearch(quranData, query, 'standard'));
    }
  }, [query, quranData, fuseInstance, advancedSearchValue]);

  const handlePress = (aya: QuranText) => {
    setSelectedAya({ aya: aya.aya_id, surah: aya.sura_id });
    setShow(true);
  };

  const renderItem = ({ item }: { item: QuranText }) => {
    return (
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel={`فتح تفسير للآية ${item.aya_id} من سورة ${item.sura_name}`}
        accessibilityHint="سيظهر نافذة تحتوي على تفسير الآية"
        onPress={() => handlePress(item)}
      >
        <SEO
          title="البحث - المصحف المفتوح"
          description="البحث في آيات القرآن الكريم"
        />
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
  };

  if (isLoading) {
    return (
      <ThemedView style={styles.container}>
        <ThemedView style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={tintColor} />
        </ThemedView>
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={styles.container}>
        <ThemedView style={styles.errorContainer}>
          <ThemedText type="defaultSemiBold">{`حدث خطأ: ${error}`}</ThemedText>
        </ThemedView>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
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
        {advancedSearchValue ? (
          <Pressable
            onPress={() => setAdvancedSearchValue(!advancedSearchValue)}
          >
            <AdvancedSearchSVG
              width={20}
              height={20}
              color={primaryColor}
              style={styles.icon}
            />
          </Pressable>
        ) : (
          <Pressable
            onPress={() => setAdvancedSearchValue(!advancedSearchValue)}
          >
            <Ionicons
              name="search"
              size={20}
              color={iconColor}
              style={[styles.icon, { color: primaryColor }]}
            />
          </Pressable>
        )}
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
    marginBottom: 10,
    alignSelf: 'center',
    maxWidth: 640,
    width: '100%',
  },

  searchInput: {
    flex: 1,
    padding: 10,
    fontSize: 16,
    textAlign: 'right',
    borderTopRightRadius: 8,
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
