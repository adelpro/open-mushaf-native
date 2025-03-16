import { useEffect, useMemo, useState } from 'react';
import { Platform, Pressable, StyleSheet } from 'react-native';

import { useRecoilValue, useSetRecoilState } from 'recoil';

import ChangeLogs from '@/components/ChangeLogs';
import MushafPage from '@/components/MushafPage';
import { ThemedSafeAreaView } from '@/components/ThemedSafeAreaView';
import TopMenu from '@/components/TopMenu';
import { currentAppVersion, topMenuState } from '@/recoil/atoms';
import { getAppVersion } from '@/utils';

export default function HomeScreen() {
  const setShowTopMenu = useSetRecoilState(topMenuState);
  const [showChangeLogs, setShowChangeLogs] = useState<boolean>(false);
  const currentAppVersionValue = useRecoilValue(currentAppVersion);

  useEffect(() => {
    const isWeb = Platform.OS === 'web';
    const appVersion = getAppVersion();
    const show = !isWeb && currentAppVersionValue !== appVersion;
    setShowChangeLogs(show);
  }, [currentAppVersionValue]);

  return (
    <ThemedSafeAreaView style={styles.container}>
      <TopMenu />
      <Pressable style={styles.content} onPress={() => setShowTopMenu(true)}>
        {showChangeLogs ? <ChangeLogs /> : <MushafPage />}
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
