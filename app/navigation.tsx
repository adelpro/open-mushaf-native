import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Feather } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';
import { useRecoilState } from 'recoil';

import quranJson from '@/assets/quran-metadata/mushaf-elmadina-warsh-azrak/quran.json';
import surahs from '@/assets/quran-metadata/mushaf-elmadina-warsh-azrak/surah.json';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { defaultNumberOfPages } from '@/constants';
import { currentSavedPage } from '@/recoil/atoms';
import { QuranText } from '@/types';

export default function Navigation() {
  const router = useRouter();
  const pages = Array.from({ length: defaultNumberOfPages }, (_, i) => i + 1);
  const [currentSavedPageValue, setCurrentSavedPage] =
    useRecoilState(currentSavedPage);
  const quranText: QuranText[] = quranJson as QuranText[];
  const [currentSurah, setCurrentSurah] = useState<number>(1);
  const [currentAyaNumber, setCurrentAyaNumber] = useState<number>(1);
  const [numberOfAyahs, setNumberOfAyahs] = useState<number[]>([]);

  useEffect(() => {
    if (!currentSavedPageValue) {
      return;
    }

    const surah = surahs.find((surah, index) => {
      const startingPage = surah.startingPage;
      const nextSurahStartingPage =
        surahs[index + 1]?.startingPage || defaultNumberOfPages + 1;
      return (
        currentSavedPageValue >= startingPage &&
        currentSavedPageValue < nextSurahStartingPage
      );
    });

    if (surah) {
      setCurrentSurah(surah.number);
      setNumberOfAyahs(
        Array.from({ length: surah.numberOfAyahs }, (_, i) => i + 1),
      );
    }

    const aya = quranText.find((aya) => {
      if (!surah) return false;
      return (
        aya.sura_id === surah?.number && aya.page_id === currentSavedPageValue
      );
    });

    if (aya) {
      setCurrentAyaNumber(aya.aya_id - 1);
    }
  }, [currentSavedPageValue, quranText, setCurrentSavedPage]);

  const handleSurahChange = (surahNumber: number) => {
    setCurrentSurah(surahNumber);
    const selectedSurah = surahs[surahNumber - 1];
    setNumberOfAyahs(
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
      setCurrentSavedPage(filteredAya.page_id);
      router.push({
        pathname: '/',
        params: { page: filteredAya.page_id.toString() },
      });
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.navigationSection}>
        <View style={styles.labelContainer}>
          <Feather
            name="file-text"
            size={24}
            color="black"
            style={styles.icon}
          />
          <ThemedText style={styles.label}>الانتقال إلى الصفحة:</ThemedText>
        </View>
        <Picker
          style={styles.pickerContainer}
          selectedValue={currentSavedPageValue}
          onValueChange={(itemValue) => {
            setCurrentSavedPage(Number(itemValue));
            router.push({
              pathname: '/',
              params: { page: itemValue.toString() },
            });
          }}
        >
          {pages.map((page) => (
            <Picker.Item key={page} label={page.toString()} value={page} />
          ))}
        </Picker>
      </ThemedView>

      <ThemedView style={styles.navigationSection}>
        <View style={styles.labelContainer}>
          <Feather
            name="book-open"
            size={24}
            color="black"
            style={styles.icon}
          />
          <ThemedText style={styles.label}>الانتقال إلى الآية:</ThemedText>
        </View>
        <ThemedView style={styles.pickerContainer}>
          <Picker
            style={[styles.picker, styles.surahPicker]}
            selectedValue={currentSurah}
            onValueChange={handleSurahChange}
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
            style={[styles.picker, styles.ayaPicker]}
            selectedValue={currentAyaNumber}
            onValueChange={handleAyaChange}
          >
            {numberOfAyahs.map((aya) => (
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
    padding: 15,
    width: '100%',
    maxWidth: 640,
  },
  labelContainer: {
    flexDirection: 'row',
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'transparent',
    paddingVertical: 5,
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
    textAlign: 'center',
  },
  ayaPicker: {
    marginRight: 10,
    textAlign: 'center',
  },
  separator: {
    fontSize: 20,
    fontWeight: 'bold',
    marginHorizontal: 10,
  },
});
