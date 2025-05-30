import { useEffect, useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { useAtomValue, useSetAtom } from 'jotai/react';

import ChangeLogs from '@/components/ChangeLogs';
import MushafPage from '@/components/MushafPage';
import ReadingPositionBanner from '@/components/ReadingPositionBanner';
import SelectRiwaya from '@/components/SelectRiwaya';
import SEO from '@/components/seo';
import { ThemedSafeAreaView } from '@/components/ThemedSafeAreaView';
import { ThemedView } from '@/components/ThemedView';
import TopMenu from '@/components/TopMenu';
import TutorialGuide from '@/components/TutorialGuide';
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
  const currentAppVersionValue = useAtomValue(currentAppVersion);
  const finishedTutorialValue = useAtomValue(finishedTutorial);
  const mushafRiwayaValue = useAtomValue(mushafRiwaya);

  useEffect(() => {
    const appVersion = getAppVersion();
    const show = !isWeb && currentAppVersionValue !== appVersion;
    setShowChangeLogs(show);
  }, [currentAppVersionValue]);

  return (
    <ThemedSafeAreaView style={styles.container} disableTopInset={true}>
      <SEO
        title="المصحف المفتوح - المصحف"
        description="قرآءة القرآن مع خيارات متعددة للقراءات والتفاسير"
      />

      <ReadingPositionBanner />
      <Pressable style={styles.content} onPress={() => setShowTopMenu(true)}>
        {showChangeLogs ? (
          <ChangeLogs />
        ) : !finishedTutorialValue ? (
          <ThemedView style={{ width: '100%', height: '100%' }}>
            <TutorialGuide />
          </ThemedView>
        ) : mushafRiwayaValue === undefined ? (
          <SelectRiwaya />
        ) : (
          <>
            <TopMenu />
            <MushafPage />
          </>
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
    position: 'relative',
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
