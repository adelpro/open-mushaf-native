import { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { useRouter } from 'expo-router';
import { useAtomValue, useSetAtom } from 'jotai/react';

import {
  ChangeLogs,
  ReadingPositionBanner,
  SelectRiwaya,
  Seo,
  ThemedView,
  TopMenu,
  TutorialGuide,
} from '@/components';
import { MushafPageSvg } from '@/components/MushafPageSvg';
import {
  currentAppVersion,
  finishedTutorial,
  firstLaunchSeenDownloads,
  mushafRiwaya,
  topMenuState,
} from '@/jotai/atoms';
import { Riwaya } from '@/types';
import { getAppVersion, isWeb } from '@/utils';

export default function HomeScreen() {
  const router = useRouter();
  const setShowTopMenu = useSetAtom(topMenuState);
  const [showChangeLogs, setShowChangeLogs] = useState<boolean>(false);
  const setCurrentVersionValue = useSetAtom(currentAppVersion);
  const setFirstLaunchSeen = useSetAtom(firstLaunchSeenDownloads);
  const currentAppVersionValue = useAtomValue(currentAppVersion);
  const firstLaunchSeen = useAtomValue(firstLaunchSeenDownloads);
  const finishedTutorialValue = useAtomValue(finishedTutorial);
  const mushafRiwayaValue = useAtomValue(mushafRiwaya);

  useEffect(() => {
    const appVersion = getAppVersion();
    const show = !isWeb && currentAppVersionValue !== appVersion;
    setShowChangeLogs(show);
  }, [currentAppVersionValue]);

  // First-launch behavior: navigate to the Downloads page so the
  // user can pick what they want offline. We flag `firstLaunchSeen`
  // here so the user isn't yanked back here on every cold start
  // until the next app version bump.
  useEffect(() => {
    if (isWeb) return;
    if (firstLaunchSeen) return;
    const appVersion = getAppVersion();
    if (!appVersion) return;
    setFirstLaunchSeen(true);
    // Run after mount so navigation doesn't fight the first paint.
    const id = setTimeout(() => router.push('/downloads'), 250);
    return () => clearTimeout(id);
  }, [firstLaunchSeen, router, setFirstLaunchSeen]);

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
          <TutorialGuide />
        ) : mushafRiwayaValue === undefined ? (
          <SelectRiwaya />
        ) : (
          <>
            <TopMenu />

            <MushafPageSvg riwaya={mushafRiwayaValue as Riwaya} />
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
