import { Suspense, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  useColorScheme,
} from 'react-native';

import { Audio } from 'expo-av';
import { Image } from 'expo-image';
import { activateKeepAwakeAsync } from 'expo-keep-awake';
import { useRouter } from 'expo-router';
import { GestureDetector } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { useRecoilValue } from 'recoil';

import { blurhash, defaultNumberOfPages } from '@/constants';
import { useColors } from '@/hooks/useColors';
import useCurrentPage from '@/hooks/useCurrentPage';
import useImagesArray from '@/hooks/useImagesArray';
import { usePanGestureHandler } from '@/hooks/usePanGestureHandler';
import { flipSound } from '@/recoil/atoms';

import PageOverlay from './PageOverlay';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

export default function MushafPage() {
  const sound = useRef<Audio.Sound | null>(null);
  const isFlipSoundEnabled = useRecoilValue(flipSound);
  const colorScheme = useColorScheme();
  const { tintColor } = useColors();
  const router = useRouter();
  const { currentPage, setCurrentPage } = useCurrentPage();
  const [dimensions, setDimensions] = useState({
    customPageWidth: 0,
    customPageHeight: 0,
  });

  /*   const {
    isLoading: assetsLoading,
    assets,
    error: assetsError,
  } = useImagesArray(); */

  const handleImageLayout = (event: any) => {
    const { width, height } = event.nativeEvent.layout;
    setDimensions({ customPageWidth: width, customPageHeight: height });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    router.replace({
      pathname: '/',
      params: { page: page.toString() },
    });

    // Play page flip sound
    if (isFlipSoundEnabled && sound.current) {
      sound.current.replayAsync();
    }
  };

  // Use the custom pan gesture handler hook
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

    const shadowOpacity = Math.abs(clampedTranslateX) / maxTranslateX;
    const opacity = Math.max(
      0.85,
      1 - Math.abs(clampedTranslateX) / maxTranslateX,
    );

    return {
      transform: [{ translateX: clampedTranslateX }],
      shadowOpacity: shadowOpacity * 0.5,
      opacity: opacity,
    };
  });

  useEffect(() => {
    if (Platform.OS !== 'web') return;
    if (document.visibilityState === 'hidden') return;

    const enableKeepAwake = async () => {
      await activateKeepAwakeAsync();
    };
    enableKeepAwake();
  }, []);

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
      if (sound.current) {
        sound.current.unloadAsync();
        sound.current = null;
      }
    };
  }, [isFlipSoundEnabled]);

  /*   if (assetsError) {
    return (
      <ThemedView style={styles.errorContainer}>
        <ThemedText>خطأ في تحميل الصفحة: {assetsError}</ThemedText>
      </ThemedView>
    );
  }

  if (assetsLoading) {
    return (
      <ThemedView
        style={[
          styles.loadingContainer,
          colorScheme === 'dark'
            ? { backgroundColor: '#808080' }
            : { backgroundColor: '#f5f1eb' },
        ]}
      >
        <ActivityIndicator size="large" color={tintColor} />
      </ThemedView>
    );
  } */

  return (
    <GestureDetector gesture={panGestureHandler}>
      <Animated.View
        style={[
          styles.imageContainer,
          animatedStyle,
          colorScheme === 'dark'
            ? { backgroundColor: '#d5d4d2' }
            : { backgroundColor: '#f5f1eb' },
        ]}
        onLayout={handleImageLayout}
      >
        {/*         <Suspense
          fallback={<ActivityIndicator size="large" color={tintColor} />}
        >
          {assets?.[0]?.uri ? (
            <Image
              style={[styles.image]}
              source={{ uri: assets?.[0]?.uri }}
              //placeholder={{ blurhash }}
              contentFit="fill"
            />
          ) : null}
        </Suspense> */}
        <PageOverlay index={currentPage} dimensions={dimensions} />
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  imageContainer: {
    position: 'relative',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
    flex: 1,
    maxWidth: 640,
    paddingVertical: 5,
    overflow: 'hidden',
  },
  image: {
    flex: 1,
    width: '100%',
  },
  errorContainer: {
    flex: 1,
    width: '100%',
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
