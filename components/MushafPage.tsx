import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  useColorScheme,
} from 'react-native';

import { Audio } from 'expo-av';
import { Image } from 'expo-image';
import {
  activateKeepAwakeAsync,
  deactivateKeepAwake,
  isAvailableAsync,
} from 'expo-keep-awake';
import { useRouter } from 'expo-router';
import { useLocalSearchParams } from 'expo-router/build/hooks';
import { GestureDetector, ScrollView } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { useRecoilValue, useSetRecoilState } from 'recoil';

import { useColors } from '@/hooks/useColors';
import useCurrentPage from '@/hooks/useCurrentPage';
import useImagePreloader from '@/hooks/useImagePreloader';
import useImagesArray from '@/hooks/useImagesArray';
import useOrientation from '@/hooks/useOrientation';
import { usePanGestureHandler } from '@/hooks/usePanGestureHandler';
import useQuranMetadata from '@/hooks/useQuranMetadata';
import {
  dailyHizbCompleted,
  dailyHizbGoal,
  flipSound,
  hizbNotification,
  mushafContrast,
  showDailyHizbCompletedBorder,
  yesterdayPage,
} from '@/recoil/atoms';
import { getSEOMetadataByPage } from '@/utils';
import { calculateThumnsBetweenPages } from '@/utils/hizbProgress';

import PageOverlay from './PageOverlay';
import SEO from './seo';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import TopNotification from './TopNotification';

export default function MushafPage() {
  const sound = useRef<Audio.Sound | null>(null);
  const isFlipSoundEnabled = useRecoilValue(flipSound);
  const mushafContrastValue = useRecoilValue(mushafContrast);
  const hizbNotificationValue = useRecoilValue(hizbNotification);
  const setDailyHizbCompletedValue = useSetRecoilState(dailyHizbCompleted);
  const showDailyHizbCompletedBorderValue = useRecoilValue(
    showDailyHizbCompletedBorder,
  );
  const yesterdayPageValue = useRecoilValue(yesterdayPage);
  const [progressValue, setProgressValue] = useState(0);
  const dailyHizbGoalValue = useRecoilValue(dailyHizbGoal);
  const dailyHizbCompletedValue = useRecoilValue(dailyHizbCompleted);

  const {
    thumnData,
    surahData,
    hizbData,
    isLoading: metadataIsLoading,
    error: metadataError,
  } = useQuranMetadata();

  const { specsData } = useQuranMetadata();
  const { defaultNumberOfPages } = specsData;

  const [currentHizb, setCurrentHizb] = useState<number | null>(null);
  const [showNotification, setShowNotification] = useState(false);
  const [showGoalBorder, setShowGoalBorder] = useState(false);

  // Add this effect to handle border visibility
  useEffect(() => {
    progressValue === 1 && setShowGoalBorder(true);
  }, [progressValue]);

  // Disable showGoalBorder after 3sec
  useEffect(() => {
    if (!showGoalBorder) {
      return;
    }

    const timer = setTimeout(() => {
      setShowGoalBorder(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, [showGoalBorder]);

  // Progress calculation effect
  useEffect(() => {
    const newProgress =
      dailyHizbGoalValue > 0
        ? dailyHizbCompletedValue.value / dailyHizbGoalValue
        : 0;
    setProgressValue(newProgress);
  }, [dailyHizbGoalValue, dailyHizbCompletedValue.value]);

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

    if (isFlipSoundEnabled && sound.current) {
      sound.current.replayAsync();
    }
  };

  const { translateX, panGestureHandler } = usePanGestureHandler(
    currentPage,
    handlePageChange,
    defaultNumberOfPages,
  );

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
    if (!isFlipSoundEnabled) return;

    const loadSound = async () => {
      const { sound: soundObject } = await Audio.Sound.createAsync(
        require('@/assets/sounds/page-flip-sound.mp3'),
      );
      sound.current = soundObject;
    };

    loadSound();

    return () => {
      sound.current?.unloadAsync().then(() => (sound.current = null));
    };
  }, [isFlipSoundEnabled]);

  useEffect(() => {
    // Find the current Hizb and handle notification logic in a single effect
    const hizb = hizbData.find((hizb) => hizb.startingPage === currentPage);

    // Determine current Hizb
    const currentHizbNumber = hizb && hizb.number !== 1 ? hizb.number : null;

    // Determine notification visibility based on multiple conditions
    const shouldShowNotification = (() => {
      // If no current Hizb or notifications are disabled, don't show
      if (!currentHizbNumber || hizbNotificationValue === 0) return false;

      // Always show for mode 1 (all Hizbs)
      if (hizbNotificationValue === 1) return true;

      // Show only for odd-numbered Hizbs in mode 2
      if (hizbNotificationValue === 2) return currentHizbNumber % 2 !== 0;

      // Default: hide notification
      return false;
    })();

    // Update states in a single effect
    setCurrentHizb(currentHizbNumber);
    setShowNotification(shouldShowNotification);
  }, [currentPage, hizbData, hizbNotificationValue]);

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
    if (typeof currentPage === 'number') {
      // Calculate thumns read between yesterday's page and current page
      const numberOfThumn = calculateThumnsBetweenPages(
        yesterdayPageValue.value,
        currentPage,
        thumnData,
      );

      // Update the progress state with new object format
      setDailyHizbCompletedValue(() => ({
        value: numberOfThumn / 8,
        date: new Date().toDateString(),
      }));
    }
  }, [currentPage, yesterdayPageValue, thumnData, setDailyHizbCompletedValue]);

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
                  ? `rgba(26, 26, 26, ${1 - mushafContrastValue})` // Dark background with inverse contrast
                  : ivoryColor,
              borderWidth:
                showDailyHizbCompletedBorderValue && showGoalBorder ? 4 : 0,
              borderColor: tintColor,
            },
          ]}
          onLayout={handleImageLayout}
        >
          {asset?.localUri ? (
            <>
              {isLandscape ? (
                <ScrollView>
                  <Image
                    style={[
                      styles.image,
                      {
                        width: '100%',
                        height: undefined,
                        aspectRatio: 0.7,
                      },
                      colorScheme === 'dark' && {
                        opacity: mushafContrastValue, // Original contrast for image
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
                      opacity: mushafContrastValue, // Original contrast for image
                    },
                  ]}
                  source={{ uri: asset?.localUri }}
                  contentFit="fill"
                />
              )}
              {/* Existing Hizb Notification */}
              <TopNotification
                show={showNotification}
                text={
                  currentHizb && hizbNotificationValue === 2
                    ? `الجزء - ${(currentHizb - 1)?.toString()}`
                    : `الحزب - ${currentHizb?.toString()}`
                }
              />
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
    position: 'relative',
    width: '100%',
    height: '100%',
    flex: 1,
    maxWidth: 640,
    paddingVertical: 5,
    overflow: 'hidden',
  },
  image: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
