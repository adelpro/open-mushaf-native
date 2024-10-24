import React, { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';

import { Feather } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';

import quranJson from '@/assets/quran-metadata/mushaf-elmadina-warsh-azrak/quran.json';
import surahs from '@/assets/quran-metadata/mushaf-elmadina-warsh-azrak/surah.json';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { defaultNumberOfPages } from '@/constants';
import { useColors } from '@/hooks/useColors';
import useCurrentPage from '@/hooks/useCurrentPage';
import { QuranText } from '@/types';

export default function Navigation() {
  const router = useRouter();
  const pages = Array.from({ length: defaultNumberOfPages }, (_, i) => i + 1);
  const { currentPage, setCurrentPage } = useCurrentPage();
  const quranText: QuranText[] = quranJson as QuranText[];
  const [currentSurah, setCurrentSurah] = useState<number>(1);
  const [currentAyaNumber, setCurrentAyaNumber] = useState<number>(1);
  const [numberOfAyas, setNumberOfAyas] = useState<number[]>([]);

  const { iconColor, textColor } = useColors();

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
    setCurrentPage(pageNumber);
    router.push({
      pathname: '/',
      params: { page: pageNumber.toString() },
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
      setCurrentPage(filteredAya.page_id);
      router.push({
        pathname: '/',
        params: { page: filteredAya.page_id.toString() },
      });
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.navigationSection}>
        <ThemedView style={styles.labelContainer}>
          <Feather
            name="file-text"
            size={24}
            color={iconColor}
            style={styles.icon}
          />
          <ThemedText style={styles.label}>الانتقال إلى الصفحة:</ThemedText>
        </ThemedView>
        <Picker
          style={[styles.pickerContainer, { color: textColor }]}
          selectedValue={currentPage}
          onValueChange={(item) => {
            handlePageChange(item);
          }}
          dropdownIconColor={iconColor}
        >
          {pages.map((page) => (
            <Picker.Item key={page} label={page.toString()} value={page} />
          ))}
        </Picker>
      </ThemedView>

      <ThemedView style={styles.navigationSection}>
        <ThemedView style={styles.labelContainer}>
          <Feather
            name="book-open"
            size={24}
            color={iconColor}
            style={styles.icon}
          />
          <ThemedText style={styles.label}>الانتقال إلى الآية:</ThemedText>
        </ThemedView>
        <ThemedView style={styles.pickerContainer}>
          <Picker
            style={[styles.picker, styles.surahPicker, { color: textColor }]}
            selectedValue={currentSurah}
            onValueChange={(item) => {
              handleSurahChange(item);
            }}
            dropdownIconColor={iconColor}
          >
            {surahs.map((surah) => (
              <Picker.Item
                key={surah.number}
                label={surah.name}
                value={surah.number}
              />
            ))}
          </Picker>
          <ThemedText style={styles.separator}>-</ThemedText>
          <Picker
            style={[styles.picker, styles.ayaPicker, { color: textColor }]}
            selectedValue={currentAyaNumber}
            onValueChange={(item) => {
              handleAyaChange(item);
            }}
            dropdownIconColor={iconColor}
          >
            {numberOfAyas.map((aya) => (
              <Picker.Item key={aya} label={aya.toString()} value={aya} />
            ))}
          </Picker>
        </ThemedView>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navigationSection: {
    marginVertical: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 10,
    padding: 5,
    width: '100%',
    maxWidth: 640,
  },
  labelContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginBottom: 10,
  },
  label: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'right',
  },
  icon: {
    marginLeft: 10,
  },
  pickerContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 1,
    textAlign: 'center',
  },
  picker: {
    flex: 1,
    height: 50,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 5,
    padding: 10,
    fontSize: 22,
  },
  surahPicker: {
    marginLeft: 10,
    minWidth: 80,
  },
  ayaPicker: {
    marginRight: 10,
  },
  separator: {
    fontSize: 20,
    fontWeight: 'bold',
    marginHorizontal: 10,
    width: 30,
  },
});
