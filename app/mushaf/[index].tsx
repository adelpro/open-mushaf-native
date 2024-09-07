import { StyleSheet, TouchableOpacity } from 'react-native';

import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  PanGestureHandler,
  PanGestureHandlerStateChangeEvent,
  State,
} from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSetRecoilState } from 'recoil';

import { ThemedView } from '@/components/ThemedView';
import TopMenu from '@/components/TopMenu';
import { topMenuState } from '@/recoil/atoms';

const blurhash =
  '|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[';

export default function MushafScreen() {
  const setShowTopMenu = useSetRecoilState(topMenuState);
  const { index } = useLocalSearchParams();
  const currentIndex = Array.isArray(index) ? index[0] : index;
  const router = useRouter();

  const handleSwipe = (event: PanGestureHandlerStateChangeEvent) => {
    const { nativeEvent } = event;
    if (nativeEvent.state === State.END) {
      if (nativeEvent.translationX > 50) {
        // Swipe Right - Go to the previous page
        router.push(`/mushaf/${parseInt(currentIndex) + 1}`);
      } else if (nativeEvent.translationX < -50) {
        // Swipe Left - Go to the next page
        router.push(`/mushaf/${parseInt(currentIndex) - 1}`);
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <TopMenu />

      <TouchableOpacity
        style={styles.content}
        onPress={() => setShowTopMenu(true)}
        onLongPress={() => alert('Long press on content')}
      >
        <PanGestureHandler onHandlerStateChange={handleSwipe}>
          <ThemedView style={styles.container}>
            <Image
              style={styles.image}
              source={`/assets/mushaf-data/mushaf-elmadina-warsh-azrak/${index}.png`}
              placeholder={{ blurhash }}
              contentFit="fill"
              transition={1000}
            />
          </ThemedView>
        </PanGestureHandler>
      </TouchableOpacity>
    </SafeAreaView>
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
