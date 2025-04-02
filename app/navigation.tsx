import React, { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';

import { Feather } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';

import quranJson from '@/assets/quran-metadata/mushaf-elmadina-warsh-azrak/quran.json';
import surahs from '@/assets/quran-metadata/mushaf-elmadina-warsh-azrak/surah.json';
import { ThemedSafeAreaView } from '@/components/ThemedSafeAreaView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { defaultNumberOfPages } from '@/constants';
import { useColors } from '@/hooks/useColors';
import useCurrentPage from '@/hooks/useCurrentPage';
import { QuranText } from '@/types';

export default function Navigation() {
  const router = useRouter();
  const pages = Array.from({ length: defaultNumberOfPages }, (_, i) => i + 1);
  const { currentPage } = useCurrentPage();
  const quranText: QuranText[] = quranJson as QuranText[];
  const [currentSurah, setCurrentSurah] = useState<number>(1);
  const [currentAyaNumber, setCurrentAyaNumber] = useState<number>(1);
  const [numberOfAyas, setNumberOfAyas] = useState<number[]>([]);

  const { iconColor, cardColor, primaryColor } = useColors();

  useEffect(() => {
    const surah = surahs.find((surah, index) => {
      const startingPage = surah.startingPage;
      const nextSurahStartingPage =
        surahs[index + 1]?.startingPage || defaultNumberOfPages + 1;
      return currentPage >= startingPage && currentPage < nextSurahStartingPage;
    });

    if (!surah) return;

    setCurrentSurah(surah.number);

    const newNumberOfAyas = Array.from(
      { length: surah.numberOfAyahs },
      (_, i) => i + 1,
    );
    setNumberOfAyas(newNumberOfAyas);

    const aya = quranText.find((aya) => {
      return aya.sura_id === surah?.number && aya.page_id === currentPage;
    });

    if (aya) {
      setCurrentAyaNumber(aya.aya_id - 1);
    }
  }, [currentPage, quranText]);

  const handlePageChange = (pageNumber: number) => {
    router.push({
      pathname: '/',
      params: { page: pageNumber.toString(), temporary: 'true' },
    });
  };

  const handleSurahChange = (surahNumber: number) => {
    setCurrentSurah(surahNumber);
    const selectedSurah = surahs[surahNumber - 1];
    setNumberOfAyas(
      Array.from({ length: selectedSurah.numberOfAyahs }, (_, i) => i + 1),
    );
    setCurrentAyaNumber(1);
  };

  const handleAyaChange = (ayaNumber: number) => {
    setCurrentAyaNumber(ayaNumber);
    const filteredAya = quranText.find((aya) => {
      return (
        aya.sura_id === Number(currentSurah) && aya.aya_id === Number(ayaNumber)
      );
    });
    if (filteredAya) {
      router.push({
        pathname: '/',
        params: { page: filteredAya.page_id.toString(), temporary: 'true' },
      });
    }
  };

  return (
    <ThemedSafeAreaView style={styles.container}>
      <ThemedView
        style={[styles.navigationSection, { backgroundColor: cardColor }]}
      >
        <ThemedView
          style={[styles.labelContainer, { backgroundColor: cardColor }]}
        >
          <Feather
            name="file-text"
            size={24}
            color={iconColor}
            style={[styles.icon, { color: primaryColor }]}
            accessibilityLabel="Page selection icon"
          />
          <ThemedText
            style={styles.label}
            accessibilityLabel="Navigate to a page"
            accessibilityRole="header"
          >
            الانتقال إلى الصفحة:
          </ThemedText>
        </ThemedView>
        <Picker
          style={[styles.pickerContainer, { color: primaryColor }]}
          selectedValue={currentPage}
          onValueChange={(item) => {
            handlePageChange(item);
          }}
          dropdownIconColor={iconColor}
          accessibilityLabel="Select page"
          accessibilityHint="Choose a page number to navigate to"
          accessibilityRole="combobox"
        >
          {pages.map((page) => (
            <Picker.Item key={page} label={page.toString()} value={page} />
          ))}
        </Picker>
      </ThemedView>

      <ThemedView
        style={[styles.navigationSection, { backgroundColor: cardColor }]}
      >
        <ThemedView
          style={[styles.labelContainer, { backgroundColor: cardColor }]}
        >
          <Feather
            name="book-open"
            size={24}
            color={iconColor}
            style={[styles.icon, { color: primaryColor }]}
            accessibilityLabel="Surah selection icon"
          />
          <ThemedText
            style={styles.label}
            accessibilityLabel="Navigate to Surah and Aya"
            accessibilityRole="header"
          >
            الانتقال إلى الآية:
          </ThemedText>
        </ThemedView>
        <ThemedView
          style={[styles.pickerContainer, { backgroundColor: cardColor }]}
        >
          <Picker
            style={[styles.picker, styles.surahPicker, { color: primaryColor }]}
            selectedValue={currentSurah}
            onValueChange={(item) => {
              handleSurahChange(item);
            }}
            dropdownIconColor={iconColor}
            accessibilityLabel="Select Surah"
            accessibilityHint="Choose a Surah from the list"
            accessibilityRole="combobox"
          >
            {surahs.map((surah) => (
              <Picker.Item
                key={surah.number}
                label={surah.name}
                value={surah.number}
              />
            ))}
          </Picker>
          <Picker
            style={[styles.picker, styles.ayaPicker, { color: primaryColor }]}
            selectedValue={currentAyaNumber}
            onValueChange={(item) => {
              handleAyaChange(item);
            }}
            dropdownIconColor={iconColor}
            accessibilityLabel="Select Aya"
            accessibilityHint="Choose an Aya from the Surah"
            accessibilityRole="combobox"
          >
            {numberOfAyas.map((aya) => (
              <Picker.Item key={aya} label={aya.toString()} value={aya} />
            ))}
          </Picker>
        </ThemedView>
      </ThemedView>
    </ThemedSafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    margin: 2,
    alignItems: 'center',
    justifyContent: 'flex-start',
    alignSelf: 'center',
    width: '100%',
    maxWidth: 640,
  },
  navigationSection: {
    marginVertical: 15,
    borderRadius: 10,
    padding: 10,
    width: '100%',
    elevation: 3,
    maxWidth: 640,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginBottom: 8,
  },
  label: {
    fontSize: 20,
    fontFamily: 'Tajawal_700Bold',
    textAlign: 'right',
  },
  icon: {
    marginHorizontal: 5,
  },
  pickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 5,
    textAlign: 'center',
    //color: '#1B3444',
  },
  picker: {
    flex: 1,
    height: 50,
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    fontSize: 22,
    //color: '#1B3444',
  },
  surahPicker: {
    marginLeft: 10,
    minWidth: 80,
  },
  ayaPicker: {
    marginRight: 10,
  },
});
