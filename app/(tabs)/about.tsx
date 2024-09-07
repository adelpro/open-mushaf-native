import { StyleSheet, TouchableOpacity } from 'react-native';

import { useSetRecoilState } from 'recoil';

import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import TopMenu from '@/components/TopMenu';
import { topMenuState } from '@/recoil/atoms';

export default function AboutScreen() {
  const setShowTopMenu = useSetRecoilState(topMenuState);
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={<></>}
    >
      <TopMenu />
      <TouchableOpacity
        style={styles.container}
        onPress={() => setShowTopMenu(true)}
        onLongPress={() => alert('Long press on content')}
      >
        <ThemedView style={styles.titleContainer}>
          <HelloWave />
        </ThemedView>
        <ThemedView style={styles.stepContainer}>
          <ThemedText type="title">About page</ThemedText>
          <ThemedText>About page text</ThemedText>
        </ThemedView>
      </TouchableOpacity>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },

  container: {
    display: 'flex',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
