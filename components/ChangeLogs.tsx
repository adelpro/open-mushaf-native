import { useEffect, useMemo } from 'react';
import { Modal, Platform, Pressable, StyleSheet } from 'react-native';

import changeLogsJSON from '@/assets/changelogs.json';
import { ThemedButton } from '@/components/ThemedButton';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

type ChangeLogsProps = {
  visible: boolean;
  onClose: () => void;
};

type PlatformKey = keyof typeof changeLogsJSON;

export default function ChangeLogs({ visible, onClose }: ChangeLogsProps) {
  const changeLogs = useMemo(() => {
    const platform = Platform.OS as PlatformKey;
    const allLogs = changeLogsJSON.all ?? [];
    const platformLogs = changeLogsJSON[platform] ?? [];
    return [...allLogs, ...platformLogs];
  }, []);

  useEffect(() => {
    if (visible && changeLogs.length === 0) {
      onClose();
    }
  }, [visible, changeLogs.length, onClose]);

  if (changeLogs.length === 0) {
    return null;
  }

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <ThemedView
          style={styles.content}
          onStartShouldSetResponder={() => true}
        >
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
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    width: '80%',
    padding: 20,
    borderRadius: 8,
    maxWidth: 400,
    elevation: 5,
    alignItems: 'center',
    writingDirection: 'rtl',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'right',
  },
  changeLogItem: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'right',
  },
});
