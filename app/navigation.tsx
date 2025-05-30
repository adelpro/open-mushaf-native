import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet } from 'react-native';

import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import PageNavigator from '@/components/PageNavigator';
import SEO from '@/components/seo';
import SurahAyaNavigator from '@/components/SurahAyaNavigator';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useColors } from '@/hooks/useColors';
import useCurrentPage from '@/hooks/useCurrentPage';
import useQuranMetadata from '@/hooks/useQuranMetadata';

export default function Navigation() {
  const router = useRouter();
  const { currentPage } = useCurrentPage();

  const [currentSurah, setCurrentSurah] = useState<number>(1);
  const [currentAyaNumber, setCurrentAyaNumber] = useState<number>(1);
  const [numberOfAyas, setNumberOfAyas] = useState<number[]>([]);

  const { iconColor, cardColor, primaryColor, tintColor } = useColors();
  const { surahData, specsData, quranData, isLoading, error } =
    useQuranMetadata();
  const { defaultNumberOfPages } = specsData;
  useEffect(() => {
    if (isLoading || error) return;

    const surah = surahData.find((surah, index) => {
      const startingPage = surah.startingPage;
      const nextSurahStartingPage =
        surahData[index + 1]?.startingPage || defaultNumberOfPages + 1;
      return currentPage >= startingPage && currentPage < nextSurahStartingPage;
    });

    if (!surah) return;

    setCurrentSurah(surah.number);

    const newNumberOfAyas = Array.from(
      { length: surah.numberOfAyahs },
      (_, i) => i + 1,
    );
    setNumberOfAyas(newNumberOfAyas);

    const aya = quranData.find((aya) => {
      return aya.sura_id === surah?.number && aya.page_id === currentPage;
    });

    if (aya) {
      setCurrentAyaNumber(aya.aya_id - 1);
    }
  }, [
    currentPage,
    quranData,
    isLoading,
    error,
    surahData,
    defaultNumberOfPages,
  ]);

  const handlePageChange = (pageNumber: number) => {
    router.push({
      pathname: '/',
      params: { page: pageNumber.toString(), temporary: 'true' },
    });
  };

  const handleSurahChange = (surahNumber: number) => {
    setCurrentSurah(surahNumber);
    const selectedSurah = surahData.find((s) => s.number === surahNumber);
    if (selectedSurah) {
      setNumberOfAyas(
        Array.from({ length: selectedSurah.numberOfAyahs }, (_, i) => i + 1),
      );
      setCurrentAyaNumber(1);
    }
  };

  const handleAyaChange = (ayaNumber: number) => {
    setCurrentAyaNumber(ayaNumber);
    const filteredAya = quranData.find((aya) => {
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
      <SEO
        title="المصحف المفتوح - التنقل"
        description="تصفح صفحات وسور وآيات القرآن الكريم بسهولة باستخدام واجهة التنقل في المصحف المفتوح"
      />
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
        <PageNavigator
          currentPage={currentPage}
          totalPages={defaultNumberOfPages}
          onPageChange={handlePageChange}
          primaryColor={primaryColor}
          iconColor={iconColor}
        />
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
        <SurahAyaNavigator
          currentSurah={currentSurah}
          currentAya={currentAyaNumber}
          ayaCount={numberOfAyas}
          onSurahChange={handleSurahChange}
          onAyaChange={handleAyaChange}
          primaryColor={primaryColor}
          iconColor={iconColor}
          cardColor={cardColor}
        />
      </ThemedView>
    </ThemedView>
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
});
