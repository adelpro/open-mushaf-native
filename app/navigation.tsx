import { useEffect, useState } from 'react';
import { ActivityIndicator } from 'react-native';

import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import {
  PageNavigator,
  Seo,
  SurahAyaNavigator,
  ThemedText,
  ThemedView,
} from '@/components';
import { useColors, useCurrentPage, useQuranMetadata } from '@/hooks';
import { styles } from '@/styles/screens/navigation.styles';

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
      (...[, i]) => i + 1,
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
        Array.from(
          { length: selectedSurah.numberOfAyahs },
          (...[, i]) => i + 1,
        ),
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

  function renderLoading() {
    return (
      <ThemedView style={styles.container}>
        <ThemedView style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={tintColor} />
        </ThemedView>
      </ThemedView>
    );
  }
  if (isLoading) return renderLoading();

  function renderLoadError() {
    return (
      <ThemedView style={styles.container}>
        <ThemedView style={styles.errorContainer}>
          <ThemedText type="defaultSemiBold">{error}</ThemedText>
        </ThemedView>
      </ThemedView>
    );
  }
  if (error) return renderLoadError();

  function renderNavigationSection() {
    function renderLabelContainer() {
      return (
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
      );
    }
    return (
      <ThemedView
        style={[styles.navigationSection, { backgroundColor: cardColor }]}
      >
        {renderLabelContainer()}
        <PageNavigator
          currentPage={currentPage}
          totalPages={defaultNumberOfPages}
          onPageChange={handlePageChange}
          primaryColor={primaryColor}
          iconColor={iconColor}
        />
      </ThemedView>
    );
  }

  function renderNavigationSection2() {
    function renderLabelContainer2() {
      return (
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
      );
    }
    return (
      <ThemedView
        style={[styles.navigationSection, { backgroundColor: cardColor }]}
      >
        {renderLabelContainer2()}
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
    );
  }
  return (
    <ThemedView style={styles.container}>
      <Seo
        title="المصحف المفتوح - التنقل"
        description="تصفح صفحات وسور وآيات القرآن الكريم بسهولة باستخدام واجهة التنقل في المصحف المفتوح"
      />
      {renderNavigationSection()}

      {renderNavigationSection2()}
    </ThemedView>
  );
}
