import React from 'react';
import { Pressable, StyleSheet, TouchableOpacity, View } from 'react-native';

import { Feather } from '@expo/vector-icons';

import { ThemedButton, ThemedText, ThemedView } from '@/components';
import { styles } from '@/styles/screens/reminders.styles';

type Props = {
  cardColor: any;
  textColor: any;
  setDeleteConfirmId: React.Dispatch<React.SetStateAction<string | null>>;
  iconColor: any;
  deleteConfirmId: string | null;
  handleDelete: (id: string) => Promise<void>;
};
export function ModalOverlay(props: Props) {
  const {
    cardColor,
    textColor,
    setDeleteConfirmId,
    iconColor,
    deleteConfirmId,
    handleDelete,
  } = props;

  function renderModalContent3() {
    function renderModalHeader() {
      return (
        <ThemedView
          style={[styles.modalHeader, { borderBottomColor: textColor }]}
        >
          <ThemedText style={[styles.modalTitle, { color: textColor }]}>
            حذف التذكير
          </ThemedText>
          <TouchableOpacity
            onPress={() => setDeleteConfirmId(null)}
            accessibilityLabel="إغلاق"
            accessibilityRole="button"
          >
            <Feather name="x" size={24} color={iconColor} />
          </TouchableOpacity>
        </ThemedView>
      );
    }

    function renderModalActionsRow() {
      return (
        <ThemedView style={styles.modalActionsRow}>
          <ThemedButton
            variant="outlined-primary"
            onPress={() => setDeleteConfirmId(null)}
            style={styles.modalButton}
          >
            إلغاء
          </ThemedButton>
          <ThemedButton
            variant="danger"
            onPress={() => deleteConfirmId && handleDelete(deleteConfirmId)}
            style={styles.modalButton}
          >
            حذف
          </ThemedButton>
        </ThemedView>
      );
    }
    return (
      <ThemedView
        style={[styles.modalContent, { backgroundColor: cardColor }]}
        onStartShouldSetResponder={() => true}
      >
        {renderModalHeader()}

        <ThemedText style={[styles.modalMessage, { color: textColor }]}>
          هل أنت متأكد من حذف هذا التذكير؟
        </ThemedText>

        {renderModalActionsRow()}
      </ThemedView>
    );
  }
  return (
    <View style={styles.modalOverlay} accessible={false}>
      <Pressable
        style={StyleSheet.absoluteFill}
        onPress={() => setDeleteConfirmId(null)}
        accessibilityLabel="إغلاق نافذة تأكيد الحذف"
        accessibilityRole="button"
      />
      {renderModalContent3()}
    </View>
  );
}
