import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  useColorScheme,
  View,
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

import { imagesMapHafs, imagesMapWarsh } from '@/constants';
import { useColors } from '@/hooks/useColors';
import useCurrentPage from '@/hooks/useCurrentPage';
import useImagePreloader from '@/hooks/useImagePreloader';
import useImagesArray from '@/hooks/useImagesArray';
import useOrientation from '@/hooks/useOrientation';
import { usePageFlipWeb } from '@/hooks/usePageFlipWeb';
import { usePanGestureHandler } from '@/hooks/usePanGestureHandler';
import useQuranMetadata from '@/hooks/useQuranMetadata';
import {
  dailyTrackerCompleted,
  dailyTrackerGoal,
  flipSound,
  gestureThresholdLandscape,
  gestureThresholdPortrait,
  hizbNotification,
  mushafContrast,
  mushafRiwaya,
  showTrackerNotification,
  yesterdayPage,
} from '@/jotai/atoms';
import { getOrCreateAsset } from '@/utils/assetCache';
import { calculateThumnsBetweenPages } from '@/utils/hizbProgress';
import { getSEOMetadataByPage } from '@/utils/quranMetadataUtils';

import { useNotification } from './NotificationProvider';
import PageOverlay from './PageOverlay';
import SEO from './seo';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

const audioSource = require('@/assets/sounds/page-flip-sound.mp3');

export default function MushafPage() {
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

  // Load adjacent page assets from cache for background rendering during flip
  const mushafRiwayaValue = useAtomValue(mushafRiwaya);
  const imagesMap = useMemo(
    () =>
      mushafRiwayaValue === 'hafs'
        ? imagesMapHafs
        : mushafRiwayaValue === 'warsh'
          ? imagesMapWarsh
          : null,
    [mushafRiwayaValue],
  );

  const getAdjacentAsset = useCallback(
    (page: number) => {
      if (
        !imagesMap ||
        page < 1 ||
        page > defaultNumberOfPages ||
        !imagesMap[page]
      )
        return null;
      const cachedAsset = getOrCreateAsset(page, imagesMap[page]);
      return cachedAsset.downloaded ? cachedAsset : null;
    },
    [imagesMap, defaultNumberOfPages],
  );

  const nextPageAsset = useMemo(
    () => getAdjacentAsset(currentPage + 1),
    [currentPage, getAdjacentAsset],
  );
  const prevPageAsset = useMemo(
    () => getAdjacentAsset(currentPage - 1),
    [currentPage, getAdjacentAsset],
  );

  // Track drag direction for showing correct background page (web only)
  const [bgDirection, setBgDirection] = useState<'next' | 'prev' | null>(null);
  const bgAsset =
    bgDirection === 'next'
      ? nextPageAsset
      : bgDirection === 'prev'
        ? prevPageAsset
        : null;

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

  const thresholdPortrait = useAtomValue(gestureThresholdPortrait);
  const thresholdLandscape = useAtomValue(gestureThresholdLandscape);

  const { translateX, panGestureHandler } = usePanGestureHandler(
    currentPage,
    handlePageChange,
    defaultNumberOfPages,
    {
      thresholdPortrait,
      thresholdLandscape,
    },
  );

  // GSAP-based page flip for web platform
  const {
    pageRef: gsapPageRef,
    overlayRef: gsapOverlayRef,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    isWeb: isWebPlatform,
  } = usePageFlipWeb({
    currentPage,
    maxPages: defaultNumberOfPages,
    onPageChange: handlePageChange,
    onDirectionChange: setBgDirection,
    sensitivity: 0.5,
    flipThreshold: 60,
    flipDuration: 0.5,
    snapBackDuration: 0.35,
  });

  // Animated visibility for native background pages during flip
  const nextBgOpacity = useAnimatedStyle(() => ({
    opacity: translateX.value < -5 ? 1 : 0,
  }));
  const prevBgOpacity = useAnimatedStyle(() => ({
    opacity: translateX.value > 5 ? 1 : 0,
  }));

  const animatedStyle = useAnimatedStyle(() => {
    const maxTranslateX = 80;
    const clampedTranslateX = Math.max(
      -maxTranslateX,
      Math.min(translateX.value, maxTranslateX),
    );

    // Calculate progress (0 to 1)
    const progress = Math.abs(clampedTranslateX) / maxTranslateX;
    const direction = clampedTranslateX > 0 ? 1 : -1;

    // Realistic page turn effect - rotation up to 45 degrees (reversed for RTL)
    const rotationAngle = -(clampedTranslateX / maxTranslateX) * 45;

    // Lift the page up as it rotates (book page lifting effect)
    const translateY = -progress * 30;

    // Scale down slightly for depth
    const scale = 1 - progress * 0.08;

    // Perspective for 3D effect
    const perspective = 800;

    return {
      transform: [
        { perspective },
        { translateX: clampedTranslateX },
        { translateY },
        { rotateY: `${rotationAngle}deg` },
        { scale },
      ],
      // Enhanced shadow for realistic page lift
      shadowColor: '#000',
      shadowOffset: {
        width: direction * progress * 20,
        height: progress * 15,
      },
      shadowOpacity: progress * 0.6,
      shadowRadius: progress * 25,
      elevation: progress * 15,
    };
  });

  // Gradient overlay animation for page turn depth effect
  const overlayStyle = useAnimatedStyle(() => {
    const maxTranslateX = 80;
    const clampedTranslateX = Math.max(
      -maxTranslateX,
      Math.min(translateX.value, maxTranslateX),
    );

    const progress = Math.abs(clampedTranslateX) / maxTranslateX;
    const direction = clampedTranslateX > 0 ? 1 : -1;

    return {
      position: 'absolute' as const,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      opacity: progress * 0.4,
      backgroundColor:
        direction > 0 ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.2)',
      pointerEvents: 'none' as const,
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
      <SEO
        title={seoMetadata.title}
        description={seoMetadata.description}
        keywords={seoMetadata.keywords}
      />
      {isWebPlatform ? (
        /* Web: GSAP-based page flip with background page */
        <View style={styles.flipContainer}>
          {/* Background page revealed during flip */}
          {bgAsset?.localUri && (
            <View
              style={[
                styles.imageContainer,
                styles.bgPage,
                {
                  backgroundColor:
                    colorScheme === 'dark'
                      ? `rgba(26, 26, 26, ${1 - mushafContrastValue})`
                      : ivoryColor,
                },
              ]}
            >
              <Image
                source={{ uri: bgAsset.localUri }}
                style={[styles.image, { width: '100%' }]}
                contentFit="fill"
                cachePolicy="memory-disk"
                transition={0}
              />
            </View>
          )}
          {/* Current page with GSAP flip */}
          <View
            ref={gsapPageRef}
            style={[
              styles.imageContainer,
              webPageStyle as any,
              {
                backgroundColor:
                  colorScheme === 'dark'
                    ? `rgba(26, 26, 26, ${1 - mushafContrastValue})`
                    : ivoryColor,
              },
            ]}
            onLayout={handleImageLayout}
            // @ts-ignore - Web-specific pointer events
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
          >
            {/* GSAP gradient overlay for depth effect */}
            <View
              ref={gsapOverlayRef}
              style={styles.gsapOverlay}
              pointerEvents="none"
            />

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
                      contentFit="fill"
                      placeholder={ivoryColor}
                      placeholderContentFit="cover"
                      transition={0}
                      cachePolicy="memory-disk"
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
                    contentFit="fill"
                    placeholder={ivoryColor}
                    placeholderContentFit="cover"
                    transition={0}
                    cachePolicy="memory-disk"
                  />
                )}
              </>
            ) : (
              <ActivityIndicator size="large" color={tintColor} />
            )}
            <PageOverlay index={currentPage} dimensions={dimensions} />
          </View>
        </View>
      ) : (
        /* Native: Gesture handler with background pages */
        <View style={styles.flipContainer}>
          {/* Next page background (shown when swiping left) */}
          {nextPageAsset?.localUri && (
            <Animated.View
              style={[
                styles.imageContainer,
                styles.bgPage,
                nextBgOpacity,
                {
                  backgroundColor:
                    colorScheme === 'dark'
                      ? `rgba(26, 26, 26, ${1 - mushafContrastValue})`
                      : ivoryColor,
                },
              ]}
            >
              <Image
                source={{ uri: nextPageAsset.localUri }}
                style={[styles.image, { width: '100%' }]}
                contentFit="fill"
                cachePolicy="memory-disk"
                transition={0}
              />
            </Animated.View>
          )}
          {/* Prev page background (shown when swiping right) */}
          {prevPageAsset?.localUri && (
            <Animated.View
              style={[
                styles.imageContainer,
                styles.bgPage,
                prevBgOpacity,
                {
                  backgroundColor:
                    colorScheme === 'dark'
                      ? `rgba(26, 26, 26, ${1 - mushafContrastValue})`
                      : ivoryColor,
                },
              ]}
            >
              <Image
                source={{ uri: prevPageAsset.localUri }}
                style={[styles.image, { width: '100%' }]}
                contentFit="fill"
                cachePolicy="memory-disk"
                transition={0}
              />
            </Animated.View>
          )}
          {/* Current page with gesture */}
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
              {/* Page turn gradient overlay */}
              <Animated.View style={overlayStyle} />

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
                        contentFit="fill"
                        placeholder={ivoryColor}
                        placeholderContentFit="cover"
                        transition={0}
                        cachePolicy="memory-disk"
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
                      contentFit="fill"
                      placeholder={ivoryColor}
                      placeholderContentFit="cover"
                      transition={0}
                      cachePolicy="memory-disk"
                    />
                  )}
                </>
              ) : (
                <ActivityIndicator size="large" color={tintColor} />
              )}
              <PageOverlay index={currentPage} dimensions={dimensions} />
            </Animated.View>
          </GestureDetector>
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  flipContainer: {
    width: '100%',
    height: '100%',
    maxWidth: 640,
  },
  imageContainer: {
    width: '100%',
    height: '100%',
    maxWidth: 640,
    overflow: 'hidden',
  },
  bgPage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
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
  gsapOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0,
  },
});

// Web-specific styles applied inline (not compatible with StyleSheet.create typing)
const webPageStyle =
  Platform.OS === 'web'
    ? {
        cursor: 'grab' as const,
        userSelect: 'none' as const,
        touchAction: 'none' as const,
        WebkitTransformStyle: 'preserve-3d' as const,
        transformStyle: 'preserve-3d' as const,
      }
    : {};
