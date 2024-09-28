import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet } from 'react-native';

import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRecoilState, useSetRecoilState } from 'recoil';

import PageOverlay from '@/components/PageOverlay';
import TopMenu from '@/components/TopMenu';
import { blurhash, Colors } from '@/constants';
import { useColorScheme } from '@/hooks/useColorScheme';
import useImagesArray from '@/hooks/useImagesArray';
import { currentSavedPage, topMenuState } from '@/recoil/atoms';

import specs from '../../assets/quran-metadata/mushaf-elmadina-warsh-azrak/specs.json';

const getCurrentPage = (value: string | string[]): number | null => {
  const result = (() => {
    const num = Array.isArray(value)
      ? parseInt(value[0], 10)
      : parseInt(value, 10);

    if (isNaN(num)) {
      return null;
    }

    if (num < 1) {
      return 1;
    }

    if (num > specs.defaultNumberOfPages) {
      return specs.defaultNumberOfPages;
    }

    return num;
  })();

  return result;
};

export default function HomeScreen() {
  const setShowTopMenu = useSetRecoilState(topMenuState);
  const [dimensions, setDimensions] = useState({
    customPageWidth: 0,
    customPageHeight: 0,
  });
  const router = useRouter();
  const colorScheme = useColorScheme();
  const tint = Colors[colorScheme ?? 'light'].tint;
  const [currentSavedPageValue, setCurrentSavedPage] =
    useRecoilState(currentSavedPage);
  const [currentPage, setCurrentPage] = useState(currentSavedPageValue);

  const { page: pageParam } = useLocalSearchParams();

  const { assets } = useImagesArray();

  const translateX = useSharedValue(0);
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

  const defaultNumberOfPages = specs.defaultNumberOfPages;
  useEffect(() => {
    const page = getCurrentPage(pageParam) ?? currentSavedPageValue;
    setCurrentPage(page);
  }, [pageParam, currentSavedPageValue]);

  const handleImageLayout = (event: any) => {
    const { width, height } = event.nativeEvent.layout;
    setDimensions({ customPageWidth: width, customPageHeight: height });
  };

  /*   useEffect(() => {
    if (assets) {
      const prevPage = Math.max(1, currentPage - 1);
      const nextPage = Math.min(defaultNumberOfPages, currentPage + 1);
      Image.prefetch(assets[prevPage - 1].uri);
      Image.prefetch(assets[nextPage - 1].uri);
    }
  }, [currentPage, assets, defaultNumberOfPages]); */

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      translateX.value = Math.max(-100, Math.min(100, e.translationX));
    })
    .onEnd(
      useCallback(
        (e) => {
          const threshold = 30; // Lower threshold for smoother transitions
          if (e.translationX > threshold) {
            // Swipe Right - Go to the next page
            let page = Math.min(currentPage + 1, defaultNumberOfPages);
            setCurrentSavedPage(page);
            router.replace({
              pathname: '/',
              params: { page: page.toString() },
            });
          } else if (e.translationX < -threshold) {
            // Swipe Left - Go to the previous page
            let page = Math.max(currentPage - 1, 1);
            setCurrentSavedPage(page);
            router.replace({
              pathname: '/',
              params: { page: page.toString() },
            });
          }
          // Smooth return to the original position
          translateX.value = withSpring(0, { damping: 20, stiffness: 90 }); // Smooth return
        },
        [
          currentPage,
          defaultNumberOfPages,
          router,
          setCurrentSavedPage,
          translateX,
        ],
      ),
    );

  return (
    <GestureHandlerRootView>
      <SafeAreaView style={styles.container}>
        <TopMenu />

        <Pressable style={styles.content} onPress={() => setShowTopMenu(true)}>
          <GestureDetector gesture={panGesture}>
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
        </Pressable>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
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
  content: {
    flex: 1,
    height: '100%',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    flex: 1,
    width: '100%',
    backgroundColor: '#f5f1eb',
  },
});
