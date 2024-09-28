import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet } from 'react-native';

import { Image } from 'expo-image';
import { useKeepAwake } from 'expo-keep-awake';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  GestureHandlerRootView,
  PanGestureHandler,
  PanGestureHandlerStateChangeEvent,
  State,
} from 'react-native-gesture-handler';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRecoilState, useSetRecoilState } from 'recoil';

import PageOverlay from '@/components/PageOverlay';
import { ThemedText } from '@/components/ThemedText';
import TopMenu from '@/components/TopMenu';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import useImagesArray from '@/hooks/useImagesArray';
import { currentSavedPage, topMenuState } from '@/recoil/atoms';

import specs from '../../assets/quran-metadata/mushaf-elmadina-warsh-azrak/specs.json';

const blurhash =
  '|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[';

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
  useKeepAwake();
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

  const defaultNumberOfPages = specs.defaultNumberOfPages;
  useEffect(() => {
    const page = getCurrentPage(pageParam) ?? currentSavedPageValue;
    setCurrentPage(page);
  }, [pageParam, currentSavedPageValue]);

  const translateX = useSharedValue(0);
  const width = dimensions.customPageWidth;
  console.log({ width });

  // Animate the swipe effect with shadow, scale, and opacity
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        {
          scale: interpolate(
            translateX.value,
            [-width, 0, width],
            [0.95, 1, 0.95],
          ),
        },
        {
          rotateY: `${interpolate(translateX.value, [-width, 0, width], [-5, 0, 5])}deg`,
        },
      ],
      opacity: interpolate(translateX.value, [-width, 0, width], [0.5, 1, 0.5]),
      elevation: interpolate(translateX.value, [-width, 0, width], [10, 0, 10]), // Add shadow effect
    };
  });

  const handleImageLayout = (event: any) => {
    const { width, height } = event.nativeEvent.layout;
    setDimensions({ customPageWidth: width, customPageHeight: height });
  };

  const { assets, error } = useImagesArray();

  const handleSwipe = ({ nativeEvent }: PanGestureHandlerStateChangeEvent) => {
    console.log({ translationXEvent: nativeEvent.translationX });
    switch (nativeEvent.state) {
      case State.END: {
        if (nativeEvent.translationX > 50) {
          // Swipe Right - Go to the previous page
          let page = currentPage + 1;
          if (page > defaultNumberOfPages) {
            page = defaultNumberOfPages;
          }
          setCurrentSavedPage(page);

          router.replace({
            pathname: '/',
            params: { page: page.toString() },
          });
        } else if (nativeEvent.translationX < -50) {
          // Swipe Left - Go to the next page
          let page = currentPage - 1;
          if (page < 1) {
            page = 1;
          }
          setCurrentSavedPage(page);
          router.replace({
            pathname: '/',
            params: { page: page.toString() },
          });
        }
        // Reset translateX with spring for animation effect
        console.log({ swipedTransalteX: translateX.value });
        translateX.value = withSpring(0, {
          damping: 5, // Increased damping for slower response
          stiffness: 80, // Reduced stiffness for smoother animation
          mass: 1,
        });
        break;
      }
      case State.ACTIVE: {
        translateX.value = nativeEvent.translationX;
        console.log(
          { translationX: translateX.value },
          nativeEvent.translationX,
        );
        break;
      }
      default:
        break;
    }
  };

  if (error) {
    return <ThemedText>{error.message}</ThemedText>;
  }

  return (
    <GestureHandlerRootView>
      <SafeAreaView style={styles.container}>
        <TopMenu />

        <Pressable style={styles.content} onPress={() => setShowTopMenu(true)}>
          <PanGestureHandler
            onHandlerStateChange={handleSwipe}
            activeOffsetX={[-10, 10]}
          >
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
          </PanGestureHandler>
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
