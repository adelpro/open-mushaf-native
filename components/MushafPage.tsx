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
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useRecoilValue } from 'recoil';

import { blurhash, Colors, defaultNumberOfPages } from '@/constants';
import useCurrentPage from '@/hooks/useCurrentPage';
import useImagesArray from '@/hooks/useImagesArray';
import { flipSound } from '@/recoil/atoms';

import PageOverlay from './PageOverlay';
import { ThemedText } from './ThemedText';

export default function MushafPage() {
  const sound = useRef<Audio.Sound | null>(null);
  const isFlipSoundEnabled = useRecoilValue(flipSound);
  const colorScheme = useColorScheme();
  const tint = Colors[colorScheme ?? 'light'].tint;

  const router = useRouter();

  const { currentPage, setCurrentPage } = useCurrentPage();

  const [dimensions, setDimensions] = useState({
    customPageWidth: 0,
    customPageHeight: 0,
  });
  const handleImageLayout = (event: any) => {
    const { width, height } = event.nativeEvent.layout;
    setDimensions({ customPageWidth: width, customPageHeight: height });
  };

  const translateX = useSharedValue(0);
  const animatedStyle = useAnimatedStyle(() => {
    const maxTranslateX = 20;
    const clampedTranslateX = Math.max(
      -maxTranslateX,
      Math.min(translateX.value, maxTranslateX),
    );

    // Dynamic shadow and opacity adjustments
    const shadowOpacity = Math.abs(clampedTranslateX) / maxTranslateX;
    const opacity = Math.max(
      0.85,
      1 - Math.abs(clampedTranslateX) / maxTranslateX,
    );

    return {
      transform: [{ translateX: clampedTranslateX }],
      perspective: 1000, // Slightly increased for better depth perception
      shadowColor: 'rgba(0, 0, 0, 0.2)', // Softer shadow color for minimalist effect
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: shadowOpacity * 0.5, // Reduce shadow intensity for subtlety
      shadowRadius: 8, // Increase shadow blur for realism
      opacity: opacity,
    };
  });

  const { assets, error: assetsError } = useImagesArray();

  const handlePageChange = async (page: number) => {
    setCurrentPage(page);
    router.replace({
      pathname: '/',
      params: { page: page.toString() },
    });

    // Play page flipsound
    if (sound.current) {
      await sound.current.replayAsync(); // Play sound
    }
  };

  const panGestureHandler = Gesture.Pan()
    .onUpdate((e) => {
      translateX.value = Math.max(-100, Math.min(100, e.translationX));
    })
    .onEnd((e) => {
      'worklet'; // Ensuring this block runs on the UI thread
      const threshold = 30; // Lower threshold for smoother transitions
      if (e.translationX > threshold) {
        // Swipe Right - Go to the next page
        runOnJS(handlePageChange)(
          Math.min(currentPage + 1, defaultNumberOfPages),
        );
      } else if (e.translationX < -threshold) {
        // Swipe Left - Go to the previous page
        runOnJS(handlePageChange)(Math.max(currentPage - 1, 1));
      }

      // Smooth return to the original position
      translateX.value = withSpring(0, { damping: 20, stiffness: 90 }); // Smooth return
    });

  // Keep the screen awake when reading mushaf
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    if (document.visibilityState === 'hidden') return;
    const enableKeepAwake = async () => {
      await activateKeepAwakeAsync();
    };
    enableKeepAwake();
  }, []);

  useEffect(() => {
    if (!isFlipSoundEnabled) {
      return;
    }
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

  if (assetsError) {
    return <ThemedText>خطا: {assetsError}</ThemedText>;
  }
  return (
    <GestureDetector gesture={panGestureHandler}>
      <Animated.View
        style={[
          styles.imageContainer,
          animatedStyle,
          colorScheme === 'dark'
            ? { backgroundColor: '#808080' }
            : { backgroundColor: '#f5f1eb' },
        ]}
        onLayout={handleImageLayout}
      >
        <Suspense fallback={<ActivityIndicator size="large" color={tint} />}>
          <Image
            style={[styles.image]}
            source={{ uri: assets?.[0]?.uri }}
            placeholder={{ blurhash }}
            contentFit="fill"
            tintColor={
              colorScheme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : undefined
            }
          />
        </Suspense>
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
});
