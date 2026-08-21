import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  useColorScheme,
} from 'react-native';

import {
  activateKeepAwakeAsync,
  deactivateKeepAwake,
  isAvailableAsync,
} from 'expo-keep-awake';
import { useRouter } from 'expo-router';
import { useLocalSearchParams } from 'expo-router/build/hooks';
import { useAtomValue, useSetAtom } from 'jotai/react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { READING_THEMES } from '@/constants/readingThemes';
import { useColors, useCurrentPage, useQuranMetadata } from '@/hooks';
import {
  dailyTrackerCompleted,
  dailyTrackerGoal,
  hizbNotification,
  mushafContrast,
  readingMode,
  readingTheme,
  showTrackerNotification,
  yesterdayPage,
} from '@/jotai/atoms';
import { calculateThumnsBetweenPages } from '@/utils/hizbProgress';
import { getSEOMetadataByPage } from '@/utils/quranMetadataUtils';

import { HorizontalMushafPage } from './HorizontalMushafPage';
import { Seo } from './Seo';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { VerticalMushafList } from './VerticalMushafList';
import { useNotification } from '../Context/NotificationProvider';

/**
 * The core viewing component representing an individual page of the Mushaf.
 * Handles the orchestration of displaying the Quran image (Hafs/Warsh), rendering interactive UI overlays,
 * preloading adjacent page assets, tracking read progress, and capturing touch gestures for navigation.
 *
 * @returns A fully interactive Mushaf page view complete with SEO metadata, localized notifications, and touch-drag support.
 */
export function MushafPage() {
  const mushafContrastValue = useAtomValue(mushafContrast);
  const readingThemeValue = useAtomValue(readingTheme);
  const readingModeValue = useAtomValue(readingMode);
  const themeConfig =
    READING_THEMES[readingThemeValue] || READING_THEMES.default;

  const hizbNotificationValue = useAtomValue(hizbNotification);
  const [showHizbNotification, setShowHizbNotification] = useState(false);

  const setDailyTrackerCompletedValue = useSetAtom(dailyTrackerCompleted);

  const showTrackerNotificationValue = useAtomValue(showTrackerNotification);
  const [showGoalNotification, setShowGoalNotification] = useState(false);

  const yesterdayPageValue = useAtomValue(yesterdayPage);
  const [progressValue, setProgressValue] = useState(0);
  const dailyTrackerGoalValue = useAtomValue(dailyTrackerGoal);
  const dailyTrackerCompletedValue = useAtomValue(dailyTrackerCompleted);

  const {
    thumnData,
    surahData,
    hizbData,
    isLoading: metadataIsLoading,
    error: metadataError,
  } = useQuranMetadata();

  const { specsData } = useQuranMetadata();
  const { defaultNumberOfPages } = specsData;
  const { notify } = useNotification();

  const colorScheme = useColorScheme();
  const { tintColor, ivoryColor } = useColors();
  const router = useRouter();

  const { currentPage, setCurrentPage, isTemporaryNavigation } =
    useCurrentPage();
  const { temporary = 'false' } = useLocalSearchParams<{
    temporary?: string;
  }>();

  const insets = useSafeAreaInsets();

  const seoMetadata = getSEOMetadataByPage(surahData, thumnData, currentPage);

  // Add this effect to handle tracker notification visibility
  useEffect(() => {
    progressValue === 1 && setShowGoalNotification(true);
  }, [progressValue]);

  // Disable showGoalNotification after 3sec
  useEffect(() => {
    if (!showGoalNotification) {
      return;
    }

    const timer = setTimeout(() => {
      setShowGoalNotification(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, [showGoalNotification]);

  useEffect(() => {
    const hizb = hizbData.find((hizb) => hizb.startingPage === currentPage);
    const currentHizbNumber = hizb && hizb.number !== 1 ? hizb.number : null;

    const shouldShowHizbNotification = (() => {
      if (!currentHizbNumber || hizbNotificationValue === 0) return false;
      if (hizbNotificationValue === 1) return true;
      if (hizbNotificationValue === 2) return currentHizbNumber % 2 !== 0;
      return false;
    })();

    if (shouldShowHizbNotification) {
      setShowHizbNotification(true);
    }
  }, [currentPage, hizbData, hizbNotificationValue]);

  // Disable showHizbNotification after 3sec
  useEffect(() => {
    if (!showHizbNotification) {
      return;
    }

    const timer = setTimeout(() => {
      setShowHizbNotification(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, [showHizbNotification]);

  // Progress calculation effect
  useEffect(() => {
    const newProgress =
      dailyTrackerGoalValue > 0
        ? dailyTrackerCompletedValue.value / dailyTrackerGoalValue
        : 0;
    setProgressValue(newProgress);
  }, [dailyTrackerGoalValue, dailyTrackerCompletedValue.value]);

  const handleSetPage = useCallback(
    (page: number) => {
      // Bounds check
      if (page < 1 || page > defaultNumberOfPages) return;
      if (page === currentPage) return;

      setCurrentPage(page);
      router.setParams({
        page: page.toString(),
        ...(temporary ? { temporary: temporary.toString() } : {}),
      });
    },
    [currentPage, defaultNumberOfPages, router, temporary, setCurrentPage],
  );

  useEffect(() => {
    const tag = 'MushafPage';
    const enableKeepAwake = async () => {
      const isAvailable = await isAvailableAsync();
      if (Platform.OS === 'web' || !isAvailable) return;
      await activateKeepAwakeAsync(tag);
    };

    enableKeepAwake();

    return () => {
      const disableKeepAwake = async () => {
        const isAvailable = await isAvailableAsync();
        if (Platform.OS !== 'web' && isAvailable) {
          deactivateKeepAwake(tag);
        }
      };
      disableKeepAwake();
    };
  }, []);

  useEffect(() => {
    // Hizb notification logic
    const hizb = hizbData.find((hizb) => hizb.startingPage === currentPage);
    const currentHizbNumber = hizb && hizb.number !== 1 ? hizb.number : null;

    // Show Hizb notification if needed
    if (showHizbNotification && currentHizbNumber !== null) {
      notify(
        hizbNotificationValue === 2
          ? `الجزء - ${(currentHizbNumber - 1)?.toString()}`
          : `الحزب - ${currentHizbNumber?.toString()}`,
        'hizb_notification',
        'neutral',
      );
    }
  }, [
    currentPage,
    hizbData,
    hizbNotificationValue,
    notify,
    showHizbNotification,
  ]);

  useEffect(() => {
    // Show tracker goal notification if needed
    if (showTrackerNotificationValue && showGoalNotification) {
      notify(
        'تم إكمال الورد اليومي بنجاح',
        'tracker_goal_notification',
        'neutral',
      );
    }
  }, [notify, showGoalNotification, showTrackerNotificationValue]);

  useEffect(() => {
    // Skip page jumps (search, jump-to-page, jump-to-surah). These change
    // `currentPage` without the user actually reading, and we must not treat
    // the resulting page delta as "hizbs completed today" — otherwise a
    // single search from page 50 to page 200 would inflate today's progress
    // by ~18 hizbs.
    if (isTemporaryNavigation) return;
    if (typeof currentPage === 'number') {
      // Calculate thumns read between yesterday's page and current page
      const numberOfThumn = calculateThumnsBetweenPages(
        yesterdayPageValue.value,
        currentPage,
        thumnData,
      );

      // Update the progress state with new object format
      setDailyTrackerCompletedValue({
        value: numberOfThumn / 8,
        date: new Date().toDateString(),
      });
    }
  }, [
    isTemporaryNavigation,
    currentPage,
    yesterdayPageValue,
    thumnData,
    setDailyTrackerCompletedValue,
  ]);

  const containerBackgroundColor =
    colorScheme === 'dark'
      ? `rgba(26, 26, 26, ${1 - mushafContrastValue})`
      : themeConfig.backgroundColor || ivoryColor;

  // Handle errors from metadata loading
  if (metadataError) {
    return (
      <ThemedView
        style={[styles.errorContainer, { backgroundColor: ivoryColor }]}
      >
        <ThemedText type="defaultSemiBold">{metadataError}</ThemedText>
      </ThemedView>
    );
  }

  // Show loading state if metadata is loading
  if (metadataIsLoading) {
    return (
      <ThemedView
        style={[styles.loadingContainer, { backgroundColor: ivoryColor }]}
      >
        <ActivityIndicator size="large" color={tintColor} />
      </ThemedView>
    );
  }

  const topOffset = isTemporaryNavigation ? 0 : insets.top;

  if (readingModeValue === 'vertical') {
    return (
      <>
        <Seo
          title={seoMetadata.title}
          description={seoMetadata.description}
          keywords={seoMetadata.keywords}
        />
        <VerticalMushafList
          currentPage={currentPage}
          totalPages={defaultNumberOfPages}
          isTemporaryNavigation={isTemporaryNavigation}
          backgroundColor={containerBackgroundColor}
          onVisiblePageChange={handleSetPage}
        />
      </>
    );
  }

  return (
    <>
      <Seo
        title={seoMetadata.title}
        description={seoMetadata.description}
        keywords={seoMetadata.keywords}
      />
      <HorizontalMushafPage
        handleSetPage={handleSetPage}
        topOffset={topOffset}
      />
    </>
  );
}

const styles = StyleSheet.create({
  errorContainer: {
    width: '100%',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingContainer: {
    width: '100%',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
