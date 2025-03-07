import { Pressable, StyleSheet } from 'react-native';

import { useAtomValue, useSetAtom } from 'jotai';

import MushafPage from '@/components/MushafPage';
import SelectRiwayaModal from '@/components/SelectRiwayaModal';
import { ThemedSafeAreaView } from '@/components/ThemedSafeAreaView';
import TopMenu from '@/components/TopMenu';
import { MushafRiwaya, topMenuStateWithEffect } from '@/jotai/atoms';

export default function HomeScreen() {
  const setShowTopMenu = useSetAtom(topMenuStateWithEffect);
  const mushafRiwayaValue = useAtomValue(MushafRiwaya);
  const showSelectRiwayaModal = mushafRiwayaValue === undefined;

  return (
    <ThemedSafeAreaView style={styles.container}>
      <TopMenu />
      <Pressable style={styles.content} onPress={() => setShowTopMenu(true)}>
        <MushafPage />
      </Pressable>
      <SelectRiwayaModal visible={showSelectRiwayaModal} />
    </ThemedSafeAreaView>
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
