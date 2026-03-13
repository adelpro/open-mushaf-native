import { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { useAtomValue, useSetAtom } from 'jotai/react';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  ChangeLogs,
  MushafPage,
  ReadingPositionBanner,
  SelectRiwaya,
  Seo,
  ThemedView,
  TopMenu,
  TutorialGuide,
} from '@/components';
import {
  currentAppVersion,
  finishedTutorial,
  mushafRiwaya,
  topMenuState,
} from '@/jotai/atoms';
import { getAppVersion, isWeb } from '@/utils';

export default function HomeScreen() {
  const setShowTopMenu = useSetAtom(topMenuState);
  const [showChangeLogs, setShowChangeLogs] = useState<boolean>(false);
  const setCurrentVersionValue = useSetAtom(currentAppVersion);
  const currentAppVersionValue = useAtomValue(currentAppVersion);
  const finishedTutorialValue = useAtomValue(finishedTutorial);
  const mushafRiwayaValue = useAtomValue(mushafRiwaya);

  useEffect(() => {
    const appVersion = getAppVersion();
    const show = !isWeb && currentAppVersionValue !== appVersion;
    setShowChangeLogs(show);
  }, [currentAppVersionValue]);

  const handleCloseChangeLogs = useCallback(() => {
    setShowChangeLogs(false);
    setCurrentVersionValue(getAppVersion());
  }, [setCurrentVersionValue]);

  return (
    <ThemedView style={styles.container}>
      <Seo
        title="المصحف المفتوح - المصحف"
        description="قرآءة القرآن مع خيارات متعددة للقراءات والتفاسير"
      />
      <ReadingPositionBanner />
      <ChangeLogs visible={showChangeLogs} onClose={handleCloseChangeLogs} />
      <Pressable style={styles.content} onPress={() => setShowTopMenu(true)}>
        {!finishedTutorialValue ? (
          <SafeAreaView
            style={{ width: '100%', height: '100%' }}
            edges={['top']}
          >
            <TutorialGuide />
          </SafeAreaView>
        ) : mushafRiwayaValue === undefined ? (
          <SafeAreaView
            style={{ width: '100%', height: '100%' }}
            edges={['top']}
          >
            <SelectRiwaya />
          </SafeAreaView>
        ) : (
          <>
            <TopMenu />
            <MushafPage />
          </>
        )}
      </Pressable>
    </ThemedView>
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
