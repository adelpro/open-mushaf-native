import React, { memo, useEffect, useState } from 'react';
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
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
} from 'react-native-reanimated';

import { useColors } from '@/hooks/useColors';
import useCurrentPage from '@/hooks/useCurrentPage';
import useImagePreloader from '@/hooks/useImagePreloader';
import useImagesArray from '@/hooks/useImagesArray';
import useOrientation from '@/hooks/useOrientation';
import { usePanGestureHandler } from '@/hooks/usePanGestureHandler';
import useQuranMetadata from '@/hooks/useQuranMetadata';
import {
  dailyTrackerCompleted,
  dailyTrackerGoal,
  flipSound,
  hizbNotification,
  mushafContrast,
  showTrackerNotification,
  yesterdayPage,
} from '@/jotai/atoms';
import { calculateThumnsBetweenPages } from '@/utils/hizbProgress';
import { getSEOMetadataByPage } from '@/utils/quranMetadataUtils';

import { useNotification } from './NotificationProvider';
import PageOverlay from './PageOverlay';
import SEO from './seo';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

const audioSource = require('@/assets/sounds/page-flip-sound.mp3');

const MushafPage = memo(function MushafPage() {
  'use memo';
  const player = useAudioPlayer(audioSource);
  const isFlipSoundEnabled = useAtomValue(flipSound);
  const mushafContrastValue = useAtomValue(mushafContrast);

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
    specsData,
    isLoading: metadataIsLoading,
    error: metadataError,
  } = useQuranMetadata();
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

  const handlePageChange = (page: number) => {
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
  };

  const { translateX, panGestureHandler } = usePanGestureHandler(
    currentPage,
    handlePageChange,
    defaultNumberOfPages,
  );

  const animatedStyle = useAnimatedStyle(() => {
    const maxTranslateX = 20;
    const absTranslateX = Math.abs(translateX.value);

    // Enhanced interpolation with Reanimated 4 optimizations
    const clampedTranslateX = interpolate(
      translateX.value,
      [-maxTranslateX, 0, maxTranslateX],
      [-maxTranslateX, 0, maxTranslateX],
      Extrapolation.CLAMP,
    );

    const shadowOpacity = interpolate(
      absTranslateX,
      [0, maxTranslateX],
      [0, 0.5],
      Extrapolation.CLAMP,
    );

    const opacity = interpolate(
      absTranslateX,
      [0, maxTranslateX],
      [1, 0.85],
      Extrapolation.CLAMP,
    );

    // Enhanced shadow with depth effect
    const shadowRadius = interpolate(
      absTranslateX,
      [0, maxTranslateX],
      [0, 8],
      Extrapolation.CLAMP,
    );

    return {
      transform: [{ translateX: clampedTranslateX }],
      shadowOpacity,
      shadowRadius,
      opacity,
      elevation: shadowRadius, // Android shadow
    };
  }, [translateX]);

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
      <SEO
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
                  : ivoryColor,
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
                    ]}
                    source={{ uri: asset?.localUri }}
                    contentFit="contain"
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
                  ]}
                  source={{ uri: asset?.localUri }}
                  contentFit="contain"
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
});

export default MushafPage;

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
