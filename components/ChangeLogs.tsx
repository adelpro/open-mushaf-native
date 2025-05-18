import React, { useMemo } from 'react';
import { StyleSheet } from 'react-native';

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

  const changeLogs = changeLogsJSON.logs;

  const handleClose = () => {
    setCurrentVersionValue(appVersion);
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.content}>
        <ThemedText style={styles.title}>ما الجديد</ThemedText>
        {changeLogs?.map((log, index) => (
          <ThemedText key={index} style={styles.changeLogItem}>
            {log}
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
  },
  content: {
    width: '80%',
    padding: 20,
    borderRadius: 5,
    maxWidth: 400,
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  changeLogItem: {
    fontSize: 16,
    marginBottom: 20,
  },
});
