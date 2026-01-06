import { useEffect, useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { useAtomValue, useSetAtom } from 'jotai/react';
import { WidgetPreview } from 'react-native-android-widget';

import ChangeLogs from '@/components/ChangeLogs';
import MushafPage from '@/components/MushafPage';
import ReadingPositionBanner from '@/components/ReadingPositionBanner';
import SelectRiwaya from '@/components/SelectRiwaya';
import SEO from '@/components/seo';
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
import AndroidWidget from '@/widgets/android';

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
    <ThemedView style={styles.container}>
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
            <WidgetPreview
              renderWidget={() => <AndroidWidget />}
              width={320}
              height={200}
            />
            {/*   <MushafPage /> */}
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
