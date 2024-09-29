import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, useColorScheme } from 'react-native';

import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useRecoilState } from 'recoil';

import { blurhash, Colors, defaultNumberOfPages } from '@/constants';
import useImagesArray from '@/hooks/useImagesArray';
import { currentSavedPage } from '@/recoil/atoms';
import { getCurrentPage } from '@/utils';

import PageOverlay from './PageOverlay';

export default function MushafPage() {
  const colorScheme = useColorScheme();
  const tint = Colors[colorScheme ?? 'light'].tint;

  const router = useRouter();
  const { page: pageParam } = useLocalSearchParams();

  const [currentSavedPageValue, setCurrentSavedPage] =
    useRecoilState(currentSavedPage);
  const [currentPage, setCurrentPage] = useState(currentSavedPageValue ?? 1);

  const [dimensions, setDimensions] = useState({
    customPageWidth: 0,
    customPageHeight: 0,
  });
  const handleImageLayout = (event: any) => {
    const { width, height } = event.nativeEvent.layout;
    setDimensions({ customPageWidth: width, customPageHeight: height });
  };

  const translateX = useSharedValue(0);
  // Animated style using translateX shared value
  const animatedStyle = useAnimatedStyle(() => {
    const rotation = translateX.value / 300; // Subtle rotation
    const shadowOpacity = Math.abs(translateX.value) / 100; // Dynamic shadow opacity
    const opacity = Math.max(0.7, 1 - Math.abs(translateX.value) / 200); // Adjust opacity based on swipe distance

    return {
      transform: [
        { translateX: translateX.value },
        { rotateY: `${rotation}rad` },
      ],
      perspective: 800,
      shadowColor: 'rgba(0, 0, 0, 0.3)', // Shadow color
      shadowOffset: {
        width: 0,
        height: 3,
      },
      shadowOpacity: shadowOpacity,
      shadowRadius: 5,
      opacity: opacity, // Dynamic opacity
    };
  });

  const { assets } = useImagesArray();
  // Prefetch images
  useEffect(() => {
    const prefetchImages = () => {
      if (assets) {
        const prevPage = Math.max(1, currentPage - 1);
        const nextPage = Math.min(defaultNumberOfPages, currentPage + 1);
        Image.prefetch(assets[prevPage - 1].uri);
        Image.prefetch(assets[nextPage - 1].uri);
      }
    };
    prefetchImages();
  }, [currentPage, assets]);

  // Set current page based on page param
  useEffect(() => {
    const page = getCurrentPage(pageParam) ?? currentSavedPageValue;
    setCurrentPage(page);
  }, [currentSavedPageValue, pageParam]);

  const handlePageChange = (page: number) => {
    setCurrentSavedPage(page);
    router.replace({
      pathname: '/',
      params: { page: page.toString() },
    });
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

  return (
    <GestureDetector gesture={panGestureHandler}>
      <Animated.View
        style={[styles.imageContainer, animatedStyle]}
        onLayout={handleImageLayout}
      >
        {assets ? (
          <Image
            style={styles.image}
            source={{ uri: assets[currentPage - 1].uri }}
            placeholder={{ blurhash }}
            contentFit="fill"
          />
        ) : (
          <ActivityIndicator size="large" color={tint} />
        )}
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
    maxWidth: 430,
    paddingVertical: 5,
    backgroundColor: '#f5f1eb',
    overflow: 'hidden',
  },
  image: {
    flex: 1,
    width: '100%',
    backgroundColor: '#f5f1eb',
  },
});
