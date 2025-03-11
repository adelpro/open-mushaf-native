import { Platform, Pressable, StyleSheet } from 'react-native';

import { useAtomValue, useSetAtom } from 'jotai';

import ChangeLogs from '@/components/ChangeLogs';
import MushafPage from '@/components/MushafPage';
import SelectRiwayaModal from '@/components/SelectRiwayaModal';
import { ThemedSafeAreaView } from '@/components/ThemedSafeAreaView';
import TopMenu from '@/components/TopMenu';
import TutorialGuide from '@/components/TutorialGuide';
import {
  currentAppVersion,
  finishedTutorial,
  MushafRiwaya,
  topMenuStateWithEffect,
} from '@/jotai/atoms';
import { getAppVersion } from '@/utils';

export default function HomeScreen() {
  const setShowTopMenu = useSetAtom(topMenuStateWithEffect);
  const mushafRiwayaValue = useAtomValue(MushafRiwaya);
  const finichedTutorialValue = useAtomValue(finishedTutorial);
  const showSelectRiwayaModal = mushafRiwayaValue === undefined;

  const currentAppVersionValue = useAtomValue(currentAppVersion);
  const appVersion = getAppVersion();
  const isWeb = Platform.OS === 'web';

  if (!isWeb && currentAppVersionValue !== appVersion) {
    return <ChangeLogs />;
  }

  if (!finichedTutorialValue) {
    return <TutorialGuide />;
  }
  return (
    <ThemedSafeAreaView style={styles.container}>
      <TopMenu />
      {!showSelectRiwayaModal ? (
        <Pressable style={styles.content} onPress={() => setShowTopMenu(true)}>
          <MushafPage />
        </Pressable>
      ) : null}

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
