import React from 'react';
import { TouchableOpacity } from 'react-native';

import { Feather } from '@expo/vector-icons';

import {
  ThemedButton,
  ThemedText,
  ThemedTextInput,
  ThemedView,
  TimePicker,
} from '@/components';
import { styles } from '@/styles/screens/reminders.styles';

type Props = {
  cardColor: any;
  textColor: any;
  setAddModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
  iconColor: any;
  newTitle: string;
  setNewTitle: React.Dispatch<React.SetStateAction<string>>;
  newHour: number;
  newMinute: number;
  setNewHour: React.Dispatch<React.SetStateAction<number>>;
  setNewMinute: React.Dispatch<React.SetStateAction<number>>;
  handleAddCustom: () => Promise<void>;
};
export function ModalContent2(props: Props) {
  const {
    cardColor,
    textColor,
    setAddModalVisible,
    iconColor,
    newTitle,
    setNewTitle,
    newHour,
    newMinute,
    setNewHour,
    setNewMinute,
    handleAddCustom,
  } = props;

  function renderModalHeader() {
    return (
      <ThemedView
        style={[styles.modalHeader, { borderBottomColor: textColor }]}
      >
        <ThemedText style={[styles.modalTitle, { color: textColor }]}>
          تذكير جديد
        </ThemedText>
        <TouchableOpacity
          onPress={() => setAddModalVisible(false)}
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

      <ThemedTextInput
        value={newTitle}
        onChangeText={setNewTitle}
        placeholder="عنوان التذكير"
        style={[
          styles.titleInput,
          { color: textColor, borderColor: iconColor },
        ]}
      />

      <TimePicker
        hour={newHour}
        minute={newMinute}
        onChange={({ hour, minute }) => {
          setNewHour(hour);
          setNewMinute(minute);
        }}
      />

      <ThemedView style={styles.modalActions}>
        <ThemedButton
          variant="primary"
          onPress={handleAddCustom}
          style={styles.modalButton}
        >
          إضافة
        </ThemedButton>
      </ThemedView>
    </ThemedView>
  );
}
