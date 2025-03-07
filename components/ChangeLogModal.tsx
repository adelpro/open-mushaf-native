import React from 'react';
import { Modal, StyleSheet } from 'react-native';

import { getAppVersion } from '@/utils';

import { ThemedButton } from './ThemedButton';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import changeLogsJSON from '../assets/changelogs.json';

type ChangeLogModalProps = {
  visible: boolean;
  onClose: () => void;
};

export default function ChangeLogModal({
  visible,
  onClose,
}: ChangeLogModalProps) {
  const appVersion = getAppVersion();
  const changeLogs = changeLogsJSON.find(
    (item) => item.version === appVersion,
  )?.logs;

  if (!changeLogs || changeLogs.length === 0) {
    return null;
  }

  return (
    <Modal visible={visible} transparent={true} animationType="slide">
      <ThemedView style={styles.modalContainer}>
        <ThemedView style={styles.modalContent}>
          <ThemedText style={styles.title}>ما الجديد</ThemedText>
          {changeLogs.map((log, index) => (
            <ThemedText key={index} style={styles.changeLogItem}>
              {log}
            </ThemedText>
          ))}
          <ThemedButton variant="primary" onPress={onClose}>
            إغلاق
          </ThemedButton>
        </ThemedView>
      </ThemedView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
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
