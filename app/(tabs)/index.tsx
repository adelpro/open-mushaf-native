import { StyleSheet, TouchableOpacity } from 'react-native';

import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSetRecoilState } from 'recoil';

import { ThemedView } from '@/components/ThemedView';
import TopMenu from '@/components/TopMenu';
import { topMenuState } from '@/recoil/atoms';

const blurhash =
  '|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[';

export default function HomeScreen() {
  const setShowTopMenu = useSetRecoilState(topMenuState);
  return (
    <SafeAreaView style={styles.container}>
      <TopMenu />
      <TouchableOpacity
        style={styles.content}
        onPress={() => setShowTopMenu(true)}
        onLongPress={() => alert('Long press on content')}
      >
        <ThemedView style={styles.container}>
          <Image
            style={styles.image}
            source="/assets/images/icon.png"
            placeholder={{ blurhash }}
            contentFit="cover"
            transition={1000}
          />
        </ThemedView>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  topMenu: {
    backgroundColor: 'rgba(0, 0, 0, 0.01)',
    marginVertical: 10,
    height: 60,
    borderRadius: 5,
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    zIndex: 2,
  },
  topMenuButton: {
    marginHorizontal: 10,
    padding: 10,
  },
  container: {
    position: 'relative',
    width: '100%',
    height: '100%',
    flex: 1,
  },
  content: {
    flex: 1,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    flex: 1,
    width: '100%',
    backgroundColor: '#0553',
  },
});
