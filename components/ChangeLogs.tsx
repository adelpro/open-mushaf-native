import { useEffect, useMemo } from 'react';
import { Modal, Platform, Pressable, StyleSheet } from 'react-native';

import changeLogsJSON from '@/assets/changelogs.json';
import { ThemedButton } from '@/components/ThemedButton';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

interface ChangeLogsProps {
  visible: boolean;
  onClose: () => void;
}

const platformLogsMap: Record<string, string[]> = {
  android: changeLogsJSON.android,
  ios: changeLogsJSON.ios,
  web: changeLogsJSON.web,
};

export function ChangeLogs({ visible, onClose }: ChangeLogsProps) {
  const changeLogs = useMemo(() => {
    const allLogs = changeLogsJSON.all ?? [];
    const platformLogs = platformLogsMap[Platform.OS] ?? [];
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
          <ThemedView style={styles.list}>
            {changeLogs.map((log, index) => (
              <ThemedText
                key={index}
                style={styles.listItemText}
              >{`${index + 1}. ${log}`}</ThemedText>
            ))}
          </ThemedView>
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
    direction: 'rtl',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  list: {
    marginBottom: 12,
    width: '100%',
  },
  listItemText: {
    fontSize: 16,
    lineHeight: 24,
    writingDirection: 'rtl',
    textAlign: 'right',
    marginBottom: 8,
  },
});
