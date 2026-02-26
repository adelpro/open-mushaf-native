import React, { useMemo } from 'react';
import { Platform, StyleSheet, useColorScheme } from 'react-native';

import { useSetAtom } from 'jotai/react';

import { currentAppVersion } from '@/jotai/atoms';
import { getAppVersion } from '@/utils';

import { ThemedButton } from './ThemedButton';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import changeLogsJSON from '../assets/changelogs.json';

export default function ChangeLogs() {
  const setCurrentVersionValue = useSetAtom(currentAppVersion);
  const appVersion = useMemo(() => getAppVersion(), []);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Get platform-specific changelogs
  const platform = Platform.OS;
  const platformLogs = changeLogsJSON[platform as keyof typeof changeLogsJSON] || changeLogsJSON.logs;
  const changeLogs = Array.isArray(platformLogs) ? platformLogs : changeLogsJSON.logs;

  const handleClose = () => {
    setCurrentVersionValue(appVersion);
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={[styles.content, isDark && styles.contentDark]}>
        <ThemedText style={styles.title}>ما الجديد</ThemedText>
        {changeLogs?.map((log, index) => (
          <ThemedText key={index} style={styles.changeLogItem}>
            • {log}
          </ThemedText>
        ))}
        <ThemedButton variant="primary" onPress={handleClose}>
          إغلاق
        </ThemedButton>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 20,
  },
  content: {
    width: '100%',
    maxWidth: 400,
    padding: 24,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    // Add shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    // Add elevation for Android
    elevation: 5,
  },
  contentDark: {
    backgroundColor: '#1c1c1e',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'right',
  },
  changeLogItem: {
    fontSize: 16,
    marginBottom: 12,
    textAlign: 'right',
    lineHeight: 24,
    writingDirection: 'rtl',
  },
});
