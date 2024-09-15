import {
  ActivityIndicator,
  StyleSheet,
  TouchableHighlight,
} from 'react-native';

import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  GestureHandlerRootView,
  PanGestureHandler,
  PanGestureHandlerStateChangeEvent,
  State,
} from 'react-native-gesture-handler';
//import Swipeable from 'react-native-gesture-handler/Swipeable';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSetRecoilState } from 'recoil';

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
    if (typeof value === 'string') {
      const num = parseInt(value, 10);
      return !isNaN(num) ? num : 1;
    }

    if (Array.isArray(value)) {
      const num = parseInt(value[0], 10);
      return !isNaN(num) ? num : 1;
    }

    return 1;
  })();

  return result;
};

export default function HomeScreen() {
  const setShowTopMenu = useSetRecoilState(topMenuState);
  const router = useRouter();
  const colorScheme = useColorScheme();
  const backgroundColor = Colors[colorScheme ?? 'light'].background;
  const tint = Colors[colorScheme ?? 'light'].tint;

  const { page: pageParam } = useLocalSearchParams();

  const defaultNumberOfPages = specs.defaultNumberOfPages;
  const currentPage = getCurrentPage(pageParam);

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

        <TouchableHighlight
          underlayColor={backgroundColor}
          style={styles.content}
          onPress={() => setShowTopMenu(true)}
          onLongPress={() => alert('Long press on content')}
        >
          <PanGestureHandler onHandlerStateChange={handleSwipe}>
            <ThemedView style={styles.container}>
              {assets ? (
                <Image
                  style={styles.image}
                  source={assets[currentPage].uri}
                  placeholder={{ blurhash }}
                  contentFit="fill"
                  transition={1000}
                />
              ) : (
                <ActivityIndicator size="large" color={tint} />
              )}
            </ThemedView>
          </PanGestureHandler>
        </TouchableHighlight>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
    flex: 1,
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
    backgroundColor: 'white',
    maxWidth: 400,
  },
});
