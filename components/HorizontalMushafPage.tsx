import React, { Fragment, useCallback, useState } from 'react';
import {
  ActivityIndicator,
  LayoutChangeEvent,
  Platform,
  useColorScheme,
} from 'react-native';

import { useAudioPlayer } from 'expo-audio';
import { Image } from 'expo-image';
import { useAtomValue } from 'jotai/react';
import { GestureDetector, ScrollView } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PAN_GESTURE_CONFIG } from '@/constants';
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
  flipSound,
  mushafContrast,
  panGestureSensitivity,
  readingTheme,
} from '@/jotai/atoms';
import { triggerSelectionHaptic } from '@/utils/triggerHaptic';

import { styles } from './HorizontalMushafPage.styles';
import { PageOverlay } from './PageOverlay';
import { ThemedText } from './ThemedText';

const audioSource = require('@/assets/sounds/page-flip-sound.mp3');

interface Props {
  handleSetPage: (page: number) => void;
  topOffset: number;
}

export function HorizontalMushafPage({ handleSetPage, topOffset }: Props) {
  const player = useAudioPlayer(audioSource);
  const isFlipSoundEnabled = useAtomValue(flipSound);
  const mushafContrastValue = useAtomValue(mushafContrast);
  const readingThemeValue = useAtomValue(readingTheme);
  const panGestureSensitivityValue = useAtomValue(panGestureSensitivity);
  const themeConfig =
    READING_THEMES[readingThemeValue] || READING_THEMES.default;

  const colorScheme = useColorScheme();
  const { tintColor } = useColors();
  const { isLandscape } = useOrientation();
  const { currentPage } = useCurrentPage();
  const { surahData, specsData } = useQuranMetadata();
  const { defaultNumberOfPages } = specsData;

  const {
    asset,
    isLoading: assetIsLoading,
    error: assetError,
  } = useImagesArray();

  useImagePreloader(currentPage);

  const { dimensions, handleImageLayout } = usePageDimensions();

  const handlePageChange = useCallback(
    (delta: number) => {
      const page = currentPage + delta;

      if (page < 1 || page > defaultNumberOfPages) return;
      if (page === currentPage) return;

      handleSetPage(page);

      if (isFlipSoundEnabled) {
        player.seekTo(0);
        player.play();
      }

      const isSurahStart = surahData.some((s) => s.startingPage === page);
      if (isSurahStart) {
        triggerSelectionHaptic();
      }
    },
    [
      currentPage,
      defaultNumberOfPages,
      handleSetPage,
      isFlipSoundEnabled,
      player,
      surahData,
    ],
  );

  const { translateX, panGestureHandler } = usePanGestureHandler(
    handlePageChange,
    panGestureSensitivityValue,
  );

  React.useEffect(() => {
    if (Platform.OS !== 'web') return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        handlePageChange(1);
      } else if (e.key === 'ArrowRight') {
        handlePageChange(-1);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [handlePageChange]);

  const animatedStyle = useAnimatedStyle(() => {
    const maxTranslateX = PAN_GESTURE_CONFIG.MAX_TRANSLATION_X;
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

  function renderAssetLoading() {
    return (
      <SafeAreaView
        style={styles.loadingContainer}
        edges={topOffset > 0 ? ['top'] : []}
      >
        <ActivityIndicator size="large" color={tintColor} />
      </SafeAreaView>
    );
  }
  if (assetIsLoading) return renderAssetLoading();

  function renderAssetError() {
    return (
      <SafeAreaView
        style={styles.errorContainer}
        edges={topOffset > 0 ? ['top'] : []}
      >
        <ThemedText type="defaultSemiBold">{assetError}</ThemedText>
      </SafeAreaView>
    );
  }
  if (assetError) return renderAssetError();

  function renderImage() {
    return (
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
        onLayout={handleImageLayout}
      />
    );
  }

  function renderImageContainer() {
    function renderSafeAreaView() {
      function renderContent() {
        function renderImage2() {
          return (
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
              onLayout={handleImageLayout}
            />
          );
        }
        return (
          <Fragment>
            {isLandscape ? (
              <ScrollView style={styles.scrollContainer}>
                {renderImage()}
              </ScrollView>
            ) : (
              renderImage2()
            )}
          </Fragment>
        );
      }
      return (
        <SafeAreaView style={{ flex: 1 }} edges={topOffset > 0 ? ['top'] : []}>
          {asset?.localUri ? (
            renderContent()
          ) : (
            <ActivityIndicator size="large" color={tintColor} />
          )}
          <PageOverlay
            index={currentPage}
            dimensions={dimensions}
            topOffset={topOffset}
          />
        </SafeAreaView>
      );
    }
    return (
      <Animated.View style={[styles.imageContainer, animatedStyle]}>
        {renderSafeAreaView()}
      </Animated.View>
    );
  }
  return (
    <GestureDetector gesture={panGestureHandler}>
      {renderImageContainer()}
    </GestureDetector>
  );
}

function usePageDimensions() {
  const [dimensions, setDimensions] = useState({
    customPageWidth: 0,
    customPageHeight: 0,
  });

  // Records image dimensions used to position PageOverlay.
  const handleImageLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setDimensions({ customPageWidth: width, customPageHeight: height });
  };

  return { dimensions, handleImageLayout };
}
