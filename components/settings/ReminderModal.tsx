import type { Dispatch, JSX, SetStateAction } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { styles } from '@/styles/screens/settings.styles';

type Props = {
  confirmModalVisible: boolean;
  setConfirmModalVisible: Dispatch<SetStateAction<boolean>>;
  renderModalContent: () => JSX.Element;
};
export function ReminderModal(props: Props) {
  const { confirmModalVisible, setConfirmModalVisible, renderModalContent } =
    props;

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={confirmModalVisible}
      onRequestClose={() => {
        setConfirmModalVisible(false);
      }}
    >
      <View style={styles.modalOverlay} accessible={false}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={() => setConfirmModalVisible(false)}
          accessibilityLabel="إغلاق نافذة التأكيد"
          accessibilityRole="button"
        />
        {renderModalContent()}
      </View>
    </Modal>
  );
}
