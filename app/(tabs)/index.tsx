import { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { useAtom, useAtomValue, useSetAtom } from 'jotai/react';

import {
  ChangeLogs,
  MushafPage,
  ReadingPositionBanner,
  SelectRiwaya,
  Seo,
  ThemedView,
  TopMenu,
} from '@/components';
import { RIWAYAT_LIST } from '@/constants';
import { useMushafDownload } from '@/hooks';
import {
  currentAppVersion,
  downloadedRiwayat,
  firstLaunchSeenDownloads,
  mushafRiwaya,
  topMenuState,
} from '@/jotai/atoms';
import { getAppVersion, isWeb } from '@/utils';

export default function HomeScreen() {
  const setShowTopMenu = useSetAtom(topMenuState);
  const [showChangeLogs, setShowChangeLogs] = useState<boolean>(false);
  const setCurrentVersionValue = useSetAtom(currentAppVersion);
  const currentAppVersionValue = useAtomValue(currentAppVersion);
  const mushafRiwayaValue = useAtomValue(mushafRiwaya);
  const firstLaunchSeen = useAtomValue(firstLaunchSeenDownloads);
  const setFirstLaunchSeen = useSetAtom(firstLaunchSeenDownloads);
  const [, setDownloadedRiwayat] = useAtom(downloadedRiwayat);
  const { startRiwaya } = useMushafDownload();

  useEffect(() => {
    const appVersion = getAppVersion();
    const show = !isWeb && currentAppVersionValue !== appVersion;
    setShowChangeLogs(show);
  }, [currentAppVersionValue]);
  // download all riwaya on first app launch
  useEffect(() => {
    if (firstLaunchSeen) return;
    void (async () => {
      for (const riwaya of RIWAYAT_LIST) {
        try {
          await startRiwaya(riwaya);
          setDownloadedRiwayat((previous) =>
            previous.includes(riwaya) ? previous : [...previous, riwaya],
          );
        } catch {
          // The downloads screen can retry a failed first-launch download.
        } finally {
          setFirstLaunchSeen(true);
        }
      }
    })();
  }, [firstLaunchSeen, setDownloadedRiwayat, setFirstLaunchSeen, startRiwaya]);

  const handleCloseChangeLogs = useCallback(() => {
    setShowChangeLogs(false);
    setCurrentVersionValue(getAppVersion());
  }, [setCurrentVersionValue]);
  console.log(mushafRiwayaValue);
  return (
    <ThemedView style={styles.container}>
      <Seo
        title="المصحف المفتوح - المصحف"
        description="قرآءة القرآن مع خيارات متعددة للقراءات والتفاسير"
      />
      <ReadingPositionBanner />
      <ChangeLogs visible={showChangeLogs} onClose={handleCloseChangeLogs} />
      <Pressable style={styles.content} onPress={() => setShowTopMenu(true)}>
        {mushafRiwayaValue === undefined ? (
          <SelectRiwaya />
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
