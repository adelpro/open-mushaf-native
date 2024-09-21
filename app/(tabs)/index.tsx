import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet } from 'react-native';

import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  GestureHandlerRootView,
  PanGestureHandler,
  PanGestureHandlerStateChangeEvent,
  State,
} from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSetRecoilState } from 'recoil';

import PageOverlay from '@/components/PageOverlay';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import TopMenu from '@/components/TopMenu';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import useImagesArray from '@/hooks/useImagesArray';
import { topMenuState } from '@/recoil/atoms';

import specs from '../../assets/quran-metadata/mushaf-elmadina-warsh-azrak/specs.json';

const blurhash =
  '|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[';

const getCurrentPage = (value: string | string[]): number => {
  const result = (() => {
    const num = Array.isArray(value)
      ? parseInt(value[0], 10)
      : parseInt(value, 10);

    if (isNaN(num)) {
      return 1;
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

  const { page: pageParam } = useLocalSearchParams();

  const defaultNumberOfPages = specs.defaultNumberOfPages;
  const currentPage = getCurrentPage(pageParam);

  const handleImageLayout = (event: any) => {
    const { width, height } = event.nativeEvent.layout;
    setDimensions({ customPageWidth: width, customPageHeight: height });
  };

  const { assets, error } = useImagesArray();

  const handleSwipe = (event: PanGestureHandlerStateChangeEvent) => {
    const { nativeEvent } = event;
    if (nativeEvent.state === State.END) {
      if (nativeEvent.translationX > 50) {
        // Swipe Right - Go to the previous page
        let page = currentPage + 1;
        if (page > defaultNumberOfPages) {
          page = defaultNumberOfPages;
        }

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

        router.replace({
          pathname: '/',
          params: { page: page.toString() },
        });
      }
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
          <PanGestureHandler onHandlerStateChange={handleSwipe}>
            <ThemedView
              style={styles.imageContainer}
              onLayout={handleImageLayout}
            >
              {assets ? (
                <Image
                  style={styles.image}
                  source={assets[currentPage - 1].uri}
                  placeholder={{ blurhash }}
                  contentFit="fill"
                  transition={1000}
                />
              ) : (
                <ActivityIndicator size="large" color={tint} />
              )}
              <PageOverlay index={currentPage} dimensions={dimensions} />
            </ThemedView>
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
    paddingHorizontal: 5,
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
