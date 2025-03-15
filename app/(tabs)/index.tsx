import { useMemo } from 'react';
import { Platform, Pressable, StyleSheet } from 'react-native';

import { useAtom, useAtomValue } from 'jotai';

import ChangeLogs from '@/components/ChangeLogs';
import MushafPage from '@/components/MushafPage';
import SelectRiwaya from '@/components/SelectRiwaya';
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
  const [topMenuStateValue, setShowTopMenu] = useAtom(topMenuStateWithEffect);
  const mushafRiwayaValue = useAtomValue(MushafRiwaya);
  const finishedTutorialValue = useAtomValue(finishedTutorial);

  const currentAppVersionValue = useAtomValue(currentAppVersion);
  const appVersion = useMemo(() => getAppVersion(), []);
  const isWeb = Platform.OS === 'web';

  const showChangeLogs = !isWeb && currentAppVersionValue !== appVersion;

  return (
    <ThemedSafeAreaView style={styles.container}>
      <TopMenu />

      <Pressable
        style={styles.content}
        onPress={() => {
          if (!topMenuStateValue) {
            setShowTopMenu(true);
          }
        }}
      >
        {showChangeLogs ? (
          <ChangeLogs />
        ) : !finishedTutorialValue ? (
          <TutorialGuide />
        ) : mushafRiwayaValue === undefined ? (
          <SelectRiwaya />
        ) : (
          <MushafPage />
        )}
      </Pressable>
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
