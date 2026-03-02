import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  useColorScheme,
} from 'react-native';

import { useAudioPlayer } from 'expo-audio';
import { Image } from 'expo-image';
import {
  activateKeepAwakeAsync,
  deactivateKeepAwake,
  isAvailableAsync,
} from 'expo-keep-awake';
import { useRouter } from 'expo-router';
import { useLocalSearchParams } from 'expo-router/build/hooks';
import { useAtomValue, useSetAtom } from 'jotai/react';
import { GestureDetector, ScrollView } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';

import { READING_THEMES } from '@/constants/readingThemes';
import {
  useColors,
  useCurrentPage,
  useImagePreloader,
  useImagesArray,
  useOrientation,
  usePanGestureHandler,
  useQuranMetadata,
} from '@/hooks';
import {
  dailyTrackerCompleted,
  dailyTrackerGoal,
  flipSound,
  hizbNotification,
  mushafContrast,
  readingTheme,
  showTrackerNotification,
  yesterdayPage,
} from '@/jotai/atoms';
import { calculateThumnsBetweenPages } from '@/utils/hizbProgress';
import { getSEOMetadataByPage } from '@/utils/quranMetadataUtils';
import { triggerSelectionHaptic } from '@/utils/triggerHaptic';

import { PageOverlay } from './PageOverlay';
import { Seo } from './Seo';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { useNotification } from '../Context/NotificationProvider';

const audioSource = require('@/assets/sounds/page-flip-sound.mp3');

export function MushafPage() {
  const player = useAudioPlayer(audioSource);
  const isFlipSoundEnabled = useAtomValue(flipSound);
  const mushafContrastValue = useAtomValue(mushafContrast);
  const readingThemeValue = useAtomValue(readingTheme);
  const themeConfig =
    READING_THEMES[readingThemeValue] || READING_THEMES.default;

  const hizbNotificationValue = useAtomValue(hizbNotification);
  const [showHizbNotification, setShowHizbNotification] = useState(false);

  const setdailyTrackerCompletedValue = useSetAtom(dailyTrackerCompleted);

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

  const { isLandscape } = useOrientation();
  const { currentPage, setCurrentPage } = useCurrentPage();
  const { temporary } = useLocalSearchParams();
  const [dimensions, setDimensions] = useState({
    customPageWidth: 0,
    customPageHeight: 0,
  });

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

  const {
    asset,
    isLoading: assetIsLoading,
    error: assetError,
  } = useImagesArray();

  // Preload adjacent pages for smoother navigation
  useImagePreloader(currentPage);

  const handleImageLayout = (event: any) => {
    const { width, height } = event.nativeEvent.layout;
    setDimensions({ customPageWidth: width, customPageHeight: height });
  };

  const handlePageChange = useCallback(
    (page: number) => {
      if (page === currentPage) return;
      setCurrentPage(page);
      router.replace({
        pathname: '/',
        params: {
          page: page.toString(),
          ...(temporary ? { temporary: temporary.toString() } : {}),
        },
      });

      if (isFlipSoundEnabled) {
        player.play();
      }

      const isSurahStart = surahData.some((s) => s.startingPage === page);
      if (isSurahStart) {
        triggerSelectionHaptic();
      }
    },
    [
      currentPage,
      router,
      temporary,
      isFlipSoundEnabled,
      player,
      setCurrentPage,
      surahData,
    ],
  );

  const { translateX, panGestureHandler } = usePanGestureHandler(
    currentPage,
    handlePageChange,
    defaultNumberOfPages,
  );

  React.useEffect(() => {
    if (Platform.OS !== 'web') return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        handlePageChange(currentPage + 1);
      } else if (e.key === 'ArrowRight') {
        handlePageChange(currentPage - 1);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [currentPage, handlePageChange]);

  const animatedStyle = useAnimatedStyle(() => {
    const maxTranslateX = 20;
    const clampedTranslateX = Math.max(
      -maxTranslateX,
      Math.min(translateX.value, maxTranslateX),
    );
    const shadowOpacity = Math.min(
      0.5,
      Math.abs(clampedTranslateX) / maxTranslateX,
    );
    const opacity = Math.max(
      0.85,
      1 - Math.abs(clampedTranslateX) / maxTranslateX,
    );

    return {
      transform: [{ translateX: clampedTranslateX }],
      shadowOpacity,
      opacity,
    };
  });

  useEffect(() => {
    const tag = 'MushafPage';
    const enableKeepAwake = async () => {
      const isAvailable = await isAvailableAsync();
      if (Platform.OS === 'web' || !isAvailable) return;
      await activateKeepAwakeAsync(tag);
    };

    enableKeepAwake();

    // Cleanup on unmount
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
    if (typeof currentPage === 'number') {
      // Calculate thumns read between yesterday's page and current page
      const numberOfThumn = calculateThumnsBetweenPages(
        yesterdayPageValue.value,
        currentPage,
        thumnData,
      );

      // Update the progress state with new object format
      setdailyTrackerCompletedValue({
        value: numberOfThumn / 8,
        date: new Date().toDateString(),
      });
    }
  }, [
    currentPage,
    yesterdayPageValue,
    thumnData,
    setdailyTrackerCompletedValue,
  ]);

  // Handle errors from metadata loading
  if (metadataError) {
    return (
      <ThemedView
        style={[styles.errorContainer, { backgroundColor: ivoryColor }]}
      >
        <ThemedText type="defaultSemiBold">{`حدث خطأ: ${metadataError}`}</ThemedText>
      </ThemedView>
    );
  }

  // Show loading state if either asset or metadata is loading
  if (assetIsLoading || metadataIsLoading) {
    return (
      <ThemedView
        style={[styles.loadingContainer, { backgroundColor: ivoryColor }]}
      >
        <ActivityIndicator size="large" color={tintColor} />
      </ThemedView>
    );
  }

  if (assetError) {
    return (
      <ThemedView
        style={[styles.errorContainer, { backgroundColor: ivoryColor }]}
      >
        <ThemedText type="defaultSemiBold">{`حدث خطأ: ${assetError}`}</ThemedText>
      </ThemedView>
    );
  }

  if (assetIsLoading) {
    return (
      <ThemedView
        style={[styles.loadingContainer, { backgroundColor: ivoryColor }]}
      >
        <ActivityIndicator size="large" color={tintColor} />
      </ThemedView>
    );
  }

  return (
    <>
      <Seo
        title={seoMetadata.title}
        description={seoMetadata.description}
        keywords={seoMetadata.keywords}
      />
      <GestureDetector gesture={panGestureHandler}>
        <Animated.View
          style={[
            styles.imageContainer,
            animatedStyle,
            {
              backgroundColor:
                colorScheme === 'dark'
                  ? `rgba(26, 26, 26, ${1 - mushafContrastValue})`
                  : themeConfig.backgroundColor || ivoryColor,
            },
          ]}
          onLayout={handleImageLayout}
        >
          {asset?.localUri ? (
            <>
              {isLandscape ? (
                <ScrollView style={styles.scrollContainer}>
                  <Image
                    style={[
                      styles.image,
                      {
                        width: '100%',
                        height: undefined,
                        aspectRatio: 0.7,
                      },
                      colorScheme === 'dark' && {
                        opacity: mushafContrastValue,
                      },
                      colorScheme !== 'dark' &&
                        themeConfig.imageOpacity < 1 && {
                          opacity: themeConfig.imageOpacity,
                        },
                    ]}
                    source={{ uri: asset?.localUri }}
                    contentFit="fill"
                  />
                </ScrollView>
              ) : (
                <Image
                  style={[
                    styles.image,
                    { width: '100%' },
                    colorScheme === 'dark' && {
                      opacity: mushafContrastValue,
                    },
                    colorScheme !== 'dark' &&
                      themeConfig.imageOpacity < 1 && {
                        opacity: themeConfig.imageOpacity,
                      },
                  ]}
                  source={{ uri: asset?.localUri }}
                  contentFit="fill"
                />
              )}
            </>
          ) : (
            <ActivityIndicator size="large" color={tintColor} />
          )}
          <PageOverlay index={currentPage} dimensions={dimensions} />
        </Animated.View>
      </GestureDetector>
    </>
  );
}

const styles = StyleSheet.create({
  imageContainer: {
    width: '100%',
    height: '100%',
    maxWidth: 640,
    overflow: 'hidden',
  },
  scrollContainer: {
    width: '100%',
    height: '100%',
    maxWidth: 640,
  },
  image: {
    flex: 1,
  },
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
