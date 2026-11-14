import type { Dispatch, SetStateAction } from 'react';
import { TouchableOpacity } from 'react-native';

import { Feather } from '@expo/vector-icons';

import { ThemedButton, ThemedText, ThemedView } from '@/components';
import { styles } from '@/styles/screens/settings.styles';
import { clearStorageAndReload } from '@/utils/storage/clearStorage';

type Props = {
  setConfirmModalVisible: Dispatch<SetStateAction<boolean>>;
  cardColor: any;
  iconColor: any;
};
export function ModalContent(props: Props) {
  const { setConfirmModalVisible, cardColor, iconColor } = props;

  function renderModalActions() {
    return (
      <ThemedView style={styles.modalActions}>
        <ThemedButton
          variant="outlined-primary"
          onPress={() => {
            setConfirmModalVisible(false);
          }}
          style={styles.modalButton}
        >
          إلغاء
        </ThemedButton>
        <ThemedButton
          variant="danger"
          onPress={() => {
            setConfirmModalVisible(false);
            clearStorageAndReload();
          }}
          style={styles.modalButton}
        >
          تأكيد
        </ThemedButton>
      </ThemedView>
    );
  }
  return (
    <ThemedView
      style={[styles.modalContent, { backgroundColor: cardColor }]}
      onStartShouldSetResponder={() => true}
    >
      <ThemedView style={styles.modalHeader}>
        <ThemedText style={styles.modalTitle}>تأكيد</ThemedText>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => {
            setConfirmModalVisible(false);
          }}
          accessibilityRole="button"
          accessibilityLabel="إغلاق نافذة التأكيد"
        >
          <Feather name="x" size={24} color={iconColor} />
        </TouchableOpacity>
      </ThemedView>

      <ThemedText style={styles.modalMessage}>
        هل أنت متأكد من رغبتك في إعادة ضبط التطبيق؟
      </ThemedText>

      {renderModalActions()}
    </ThemedView>
  );
}
