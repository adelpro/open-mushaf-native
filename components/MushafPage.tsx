import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  useColorScheme,
  useWindowDimensions,
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
import { useRecoilValue } from 'recoil';

import hizbJson from '@/assets/quran-metadata/mushaf-elmadina-warsh-azrak/hizb.json';
import { defaultNumberOfPages } from '@/constants';
import { useColors } from '@/hooks/useColors';
import useCurrentPage from '@/hooks/useCurrentPage';
import useImagesArray from '@/hooks/useImagesArray';
import { usePanGestureHandler } from '@/hooks/usePanGestureHandler';
import { flipSound, hizbNotification, mushafContrast } from '@/recoil/atoms';
import { Hizb } from '@/types';

import PageOverlay from './PageOverlay';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import TopNotification from './TopNotification';

export default function MushafPage() {
  const sound = useRef<Audio.Sound | null>(null);
  const isFlipSoundEnabled = useRecoilValue(flipSound);
  const mushafContrastValue = useRecoilValue(mushafContrast);
  const HizbNotificationValue = useRecoilValue(hizbNotification);
  const hizbData = hizbJson as Hizb[];
  const [currentHizb, setCurrentHizb] = useState<number | null>(null);
  const [showNotification, setShowNotification] = useState(false);

  const colorScheme = useColorScheme();
  const { tintColor } = useColors();
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  const { currentPage, setCurrentPage } = useCurrentPage();
  const { temporary } = useLocalSearchParams();
  const [dimensions, setDimensions] = useState({
    customPageWidth: 0,
    customPageHeight: 0,
  });

  const {
    asset,
    isLoading: assetIsLoading,
    error: assetError,
  } = useImagesArray();

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
      if (!currentHizbNumber || HizbNotificationValue === 0) return false;

      // Always show for mode 1 (all Hizbs)
      if (HizbNotificationValue === 1) return true;

      // Show only for odd-numbered Hizbs in mode 2
      if (HizbNotificationValue === 2) return currentHizbNumber % 2 !== 0;

      // Default: hide notification
      return false;
    })();

    // Update states in a single effect
    setCurrentHizb(currentHizbNumber);
    setShowNotification(shouldShowNotification);
  }, [currentPage, hizbData, HizbNotificationValue]);

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

  if (assetError) {
    return (
      <ThemedView
        style={[
          styles.errorContainer,
          colorScheme === 'dark'
            ? { backgroundColor: '#d5d4d2' }
            : { backgroundColor: '#f5f1eb' },
        ]}
      >
        <ThemedText type="defaultSemiBold">{`حدث خطأ: ${assetError}`}</ThemedText>
      </ThemedView>
    );
  }

  if (assetIsLoading) {
    return (
      <ThemedView
        style={[
          styles.loadingContainer,
          colorScheme === 'dark'
            ? { backgroundColor: '#d5d4d2' }
            : { backgroundColor: '#f5f1eb' },
        ]}
      >
        <ActivityIndicator size="large" color={tintColor} />
      </ThemedView>
    );
  }

  return (
    <GestureDetector gesture={panGestureHandler}>
      <Animated.View
        style={[
          styles.imageContainer,
          animatedStyle,
          colorScheme === 'dark'
            ? { backgroundColor: '#181818' }
            : { backgroundColor: '#f5f1eb' },
        ]}
        onLayout={handleImageLayout}
      >
        {asset?.localUri ? (
          <>
            {isLandscape ? (
              <ScrollView
                contentContainerStyle={{ alignItems: 'center' }}
                alwaysBounceVertical={true}
                nestedScrollEnabled={true}
              >
                <Image
                  style={[
                    styles.image,
                    {
                      width: '100%',
                      height: undefined,
                      aspectRatio: 0.7,
                    },
                    colorScheme === 'dark' && { opacity: mushafContrastValue },
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
                  colorScheme === 'dark' && { opacity: mushafContrastValue },
                ]}
                source={{ uri: asset?.localUri }}
                contentFit="fill"
              />
            )}
            <TopNotification
              show={showNotification}
              text={
                currentHizb && HizbNotificationValue === 2
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
