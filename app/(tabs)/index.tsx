import { useState } from 'react';
import { StyleSheet, TouchableHighlight } from 'react-native';

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

import { ThemedView } from '@/components/ThemedView';
import TopMenu from '@/components/TopMenu';
import { topMenuState } from '@/recoil/atoms';

import specs from '../../assets/quran-metadata/mushaf-elmadina-warsh-azrak/specs.json';

const blurhash =
  '|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[';

export default function HomeScreen() {
  const setShowTopMenu = useSetRecoilState(topMenuState);
  const router = useRouter();
  const { page: pageParam } = useLocalSearchParams();
  const defaultNumberOfPages = specs.defaultNumberOfPages;
  const currentPage =
    typeof pageParam === 'string' ? parseInt(pageParam, 10) : 1;
  const [imageSrc, setImageSrc] = useState<string>(
    pageParam
      ? `/assets/mushaf-data/mushaf-elmadina-warsh-azrak/${pageParam}.png`
      : `/assets/mushaf-data/mushaf-elmadina-warsh-azrak/1.png`,
  );

  const handleSwipe = (event: PanGestureHandlerStateChangeEvent) => {
    const { nativeEvent } = event;
    if (nativeEvent.state === State.END) {
      if (nativeEvent.translationX > 50) {
        // Swipe Right - Go to the previous page
        let page = currentPage + 1;
        if (page > defaultNumberOfPages) {
          page = defaultNumberOfPages;
        }
        console.log('swipe right to:', page, currentPage);
        setImageSrc(
          `/assets/mushaf-data/mushaf-elmadina-warsh-azrak/${page}.png`,
        );
        router.replace({
          pathname: '/(tabs)',
          params: { page: page.toString() },
        });
      } else if (nativeEvent.translationX < -50) {
        // Swipe Left - Go to the next page
        let page = currentPage - 1;
        if (page < 1) {
          page = 1;
        }
        console.log('swipe left to:', page);
        setImageSrc(
          `/assets/mushaf-data/mushaf-elmadina-warsh-azrak/${page}.png`,
        );
        router.replace({
          pathname: '/(tabs)',
          params: { page: page.toString() },
        });
      }
    }
  };

  return (
    <GestureHandlerRootView>
      <SafeAreaView style={styles.container}>
        <TopMenu />

        <TouchableHighlight
          underlayColor="#DDDDDD"
          style={styles.content}
          onPress={() => setShowTopMenu(true)}
          onLongPress={() => alert('Long press on content')}
        >
          <PanGestureHandler onHandlerStateChange={handleSwipe}>
            <ThemedView style={styles.container}>
              <Image
                style={styles.image}
                source={imageSrc}
                placeholder={{ blurhash }}
                contentFit="fill"
                transition={1000}
              />
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
  ball: {
    width: 100,
    height: 100,
    borderRadius: 100,
    backgroundColor: 'blue',
    alignSelf: 'center',
  },
});
