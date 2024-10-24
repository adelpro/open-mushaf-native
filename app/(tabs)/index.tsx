import { Pressable, StyleSheet } from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { useSetRecoilState } from 'recoil';

import MushafPage from '@/components/MushafPage';
import TopMenu from '@/components/TopMenu';
import { topMenuState } from '@/recoil/atoms';

export default function HomeScreen() {
  const setShowTopMenu = useSetRecoilState(topMenuState);

  return (
    <SafeAreaView style={styles.container}>
      <TopMenu />

      <Pressable style={styles.content} onPress={() => setShowTopMenu(true)}>
        {/*  <MushafPage /> */}
      </Pressable>
    </SafeAreaView>
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
  content: {
    flex: 1,
    height: '100%',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
