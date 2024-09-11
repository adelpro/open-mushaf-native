import { StyleSheet, TouchableOpacity } from 'react-native';

import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  GestureHandlerRootView,
  PanGestureHandler,
} from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSetRecoilState } from 'recoil';

import { ThemedView } from '@/components/ThemedView';
import TopMenu from '@/components/TopMenu';
import { topMenuState } from '@/recoil/atoms';
import { handleSwipe } from '@/utils/handleSwipe';

import specs from '../../assets/quran-metadata/mushaf-elmadina-warsh-azrak/specs.json';

const blurhash =
  '|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[';

export default function HomeScreen() {
  const setShowTopMenu = useSetRecoilState(topMenuState);
  const router = useRouter();
  const { page: pageParam } = useLocalSearchParams();
  const defaultNumberOfPages = specs.defaultNumberOfPages;
  const getCurentPage = (): number => {
    if (typeof pageParam !== 'string') {
      return 1;
    }
    const result = parseInt(pageParam, 10);
    if (isNaN(result)) {
      return 1;
    }
    return result;
  };

  const currentPage = getCurentPage();

  return (
    <SafeAreaView style={styles.container}>
      <GestureHandlerRootView>
        <TopMenu />
        <TouchableOpacity
          style={styles.content}
          onPress={() => setShowTopMenu(true)}
          onLongPress={() => alert('Long press on content')}
        >
          <PanGestureHandler
            onHandlerStateChange={handleSwipe(
              currentPage,
              defaultNumberOfPages,
              router,
            )}
          >
            <ThemedView style={styles.container}>
              {currentPage && (
                <Image
                  style={styles.image}
                  source={require(
                    `../../assets/mushaf-data/mushaf-elmadina-warsh-azrak/${1}.png`,
                  )}
                  placeholder={{ blurhash }}
                  contentFit="fill"
                  transition={1000}
                />
              )}
            </ThemedView>
          </PanGestureHandler>
        </TouchableOpacity>
      </GestureHandlerRootView>
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
