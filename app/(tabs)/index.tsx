import { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';

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
import { MushafPageText } from '@/components/MushafPageText';
import { useCurrentPage } from '@/hooks';
import {
  currentAppVersion,
  currentSavedPage,
  finishedTutorial,
  firstLaunchSeenDownloads,
  mushafRiwaya,
  topMenuState,
} from '@/jotai/atoms';
import { getAppVersion, isWeb } from '@/utils';

export default function HomeScreen() {
  const setShowTopMenu = useSetAtom(topMenuState);
  const [showChangeLogs, setShowChangeLogs] = useState<boolean>(false);
  const setCurrentVersionValue = useSetAtom(currentAppVersion);
  const setFirstLaunchSeen = useSetAtom(firstLaunchSeenDownloads);
  const setCurrentSavedPage = useSetAtom(currentSavedPage);
  const currentAppVersionValue = useAtomValue(currentAppVersion);
  const firstLaunchSeen = useAtomValue(firstLaunchSeenDownloads);
  const finishedTutorialValue = useAtomValue(finishedTutorial);
  const mushafRiwayaValue = useAtomValue(mushafRiwaya);
  const { currentPage } = useCurrentPage();

  // Phase 7 polish: pan-to-flip-page. Triggered by the
  // MushafPageText's internal pan gesture; persists the new page
  // via the same path useCurrentPage() already syncs to.
  const handlePageChange = useCallback(
    (delta: number) => {
      const next = currentPage + delta;
      if (next < 1 || next > 604) return;
      setCurrentSavedPage(next);
    },
    [currentPage, setCurrentSavedPage],
  );

  useEffect(() => {
    const appVersion = getAppVersion();
    const show = !isWeb && currentAppVersionValue !== appVersion;
    setShowChangeLogs(show);
  }, [currentAppVersionValue]);

  // Old "downloads checklist" — still shows once per app version
  // bump, but only after the qurani.ai wizard completes (otherwise
  // we double-route).
  useEffect(() => {
    if (isWeb) return;
    if (firstLaunchSeen) return;
    const appVersion = getAppVersion();
    if (!appVersion) return;
    setFirstLaunchSeen(true);
  }, [firstLaunchSeen, setFirstLaunchSeen]);

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

            <MushafPageText
              page={currentPage}
              onPageChange={handlePageChange}
            />
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
