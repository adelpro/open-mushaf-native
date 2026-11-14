import React from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { styles } from '@/styles/screens/reminders.styles';
import { Reminder } from '@/types/reminder';

type Props = {
  timePickerVisible: boolean;
  setTimePickerVisible: React.Dispatch<React.SetStateAction<boolean>>;
  setEditingReminder: React.Dispatch<React.SetStateAction<Reminder | null>>;
  renderModalContent: () => React.JSX.Element;
};
export function ReminderModal(props: Props) {
  const {
    timePickerVisible,
    setTimePickerVisible,
    setEditingReminder,
    renderModalContent,
  } = props;

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={timePickerVisible}
      onRequestClose={() => {
        setTimePickerVisible(false);
        setEditingReminder(null);
      }}
    >
      <View style={styles.modalOverlay}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={() => {
            setTimePickerVisible(false);
            setEditingReminder(null);
          }}
        />
        {renderModalContent()}
      </View>
    </Modal>
  );
}
