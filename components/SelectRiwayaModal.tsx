import React from 'react';
import { Modal, Pressable, StyleSheet } from 'react-native';

import { useAtom } from 'jotai';

import { useColors } from '@/hooks/useColors';
import { MushafRiwaya } from '@/jotai/atoms';

import SegmentedControl from './SegmentControl';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

type SelectRiwayaModalProps = {
  visible: boolean;
  onClose?: () => void;
};

export default function SelectRiwayaModal({
  visible,
  onClose = () => {},
}: SelectRiwayaModalProps) {
  const [mushafRiwayaValue, setMushafRiwayaValue] = useAtom(MushafRiwaya);
  const { primaryColor } = useColors();

  const options = ['ورش', 'حفص'];

  return (
    <Modal visible={visible} transparent={true} animationType="slide">
      <ThemedView style={styles.modalContainer}>
        <ThemedView style={styles.modalContent}>
          <ThemedText style={styles.title}>يرجى اختيار الرواية</ThemedText>
          <ThemedView>
            <Pressable
              style={[{ width: '100%' }]}
              accessibilityRole="radiogroup"
            >
              <SegmentedControl
                options={options}
                initialSelectedIndex={mushafRiwayaValue}
                activeColor={primaryColor}
                textColor={primaryColor}
                disabledTextColor={primaryColor}
                onSelectionChange={(index: number) => {
                  setMushafRiwayaValue(index);
                }}
              />
            </Pressable>
          </ThemedView>
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
    columnGap: 5,
    rowGap: 20,
  },

  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});
