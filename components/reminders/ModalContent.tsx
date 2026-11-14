import React from 'react';
import { TouchableOpacity } from 'react-native';

import { Feather } from '@expo/vector-icons';

import { ThemedButton, ThemedText, ThemedView, TimePicker } from '@/components';
import { styles } from '@/styles/screens/reminders.styles';
import { Reminder } from '@/types/reminder';

type Props = {
  cardColor: any;
  textColor: any;
  setTimePickerVisible: React.Dispatch<React.SetStateAction<boolean>>;
  setEditingReminder: React.Dispatch<React.SetStateAction<Reminder | null>>;
  iconColor: any;
  editingReminder: Reminder | null;
  handleTimeSave: () => Promise<void>;
};
export function ModalContent(props: Props) {
  const {
    cardColor,
    textColor,
    setTimePickerVisible,
    setEditingReminder,
    iconColor,
    editingReminder,
    handleTimeSave,
  } = props;

  function renderModalHeader() {
    return (
      <ThemedView
        style={[styles.modalHeader, { borderBottomColor: textColor }]}
      >
        <ThemedText style={[styles.modalTitle, { color: textColor }]}>
          اختر الوقت
        </ThemedText>
        <TouchableOpacity
          onPress={() => {
            setTimePickerVisible(false);
            setEditingReminder(null);
          }}
          accessibilityLabel="إغلاق"
          accessibilityRole="button"
        >
          <Feather name="x" size={24} color={iconColor} />
        </TouchableOpacity>
      </ThemedView>
    );
  }
  return (
    <ThemedView style={[styles.modalContent, { backgroundColor: cardColor }]}>
      {renderModalHeader()}

      {editingReminder && (
        <TimePicker
          hour={editingReminder.hour}
          minute={editingReminder.minute}
          onChange={({ hour, minute }) =>
            setEditingReminder((prev) =>
              prev ? { ...prev, hour, minute } : null,
            )
          }
        />
      )}

      <ThemedView style={styles.modalActions}>
        <ThemedButton
          variant="primary"
          onPress={handleTimeSave}
          style={styles.modalButton}
        >
          حفظ
        </ThemedButton>
      </ThemedView>
    </ThemedView>
  );
}
