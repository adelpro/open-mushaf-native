import { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';

import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';
import { useRecoilValue } from 'recoil';

import surahs from '@/assets/quran-metadata/mushaf-elmadina-warsh-azrak/surah.json';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { defaultNumberOfPages } from '@/constants';
import { currentSavedPage } from '@/recoil/atoms';

export default function Navigation() {
  const router = useRouter();
  const pages = Array.from({ length: defaultNumberOfPages }, (_, i) => i + 1);
  const currentSavedPageValue = useRecoilValue(currentSavedPage);

  const [currentSurah, setCurrentSurah] = useState<number>();
  const [currentAyaNumber, setCurrentAyaNumber] = useState<number>();
  const [numberOfAyahs, setNumberOfAyahs] = useState<number[]>([]);

  // Get the current surah from the current page
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
      ); // Set Ayah numbers
    }
  }, [currentSavedPageValue]);

  const handleSurahChange = (surahNumber: number) => {
    setCurrentSurah(surahNumber);
    const selectedSurah = surahs[surahNumber - 1];
    setNumberOfAyahs(
      Array.from({ length: selectedSurah.numberOfAyahs }, (_, i) => i + 1),
    );
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.navigationContainer}>
        <ThemedText>الانتقال إلى الصفحة:</ThemedText>
        <Picker
          style={styles.picker}
          selectedValue={currentSavedPageValue}
          onValueChange={(itemValue) =>
            router.push({
              pathname: '/',
              params: { page: itemValue.toString() },
            })
          }
        >
          {pages.map((page) => (
            <Picker.Item key={page} label={page.toString()} value={page} />
          ))}
        </Picker>
      </ThemedView>

      <ThemedView style={styles.navigationContainer}>
        <ThemedText>الانتقال إلى السورة:</ThemedText>
        <Picker
          style={styles.picker}
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

        <ThemedText>الآية:</ThemedText>
        <Picker
          style={styles.picker}
          selectedValue={currentAyaNumber}
          onValueChange={(itemValue) => setCurrentAyaNumber(itemValue)}
        >
          {numberOfAyahs.map((ayah) => (
            <Picker.Item key={ayah} label={ayah.toString()} value={ayah} />
          ))}
        </Picker>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  navigationContainer: {
    marginVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    width: 400,
  },
  picker: {
    padding: 10,
    fontSize: 16,
    marginHorizontal: 10,
  },
});
