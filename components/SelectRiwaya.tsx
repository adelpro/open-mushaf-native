import React from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { useAtom } from 'jotai/react';

import { riwayaOptions } from '@/constants';
import { useColors } from '@/hooks/useColors';
import { mushafRiwaya } from '@/jotai/atoms';
import { RiwayaByIndice, RiwayaByValue } from '@/utils';

import SegmentedControl from './SegmentControl';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

export default function SelectRiwaya() {
  const [mushafRiwayaValue, setMushafRiwayaValue] = useAtom(mushafRiwaya);
  const { primaryColor } = useColors();

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.contentContainer}>
        <ThemedText
          type="defaultSemiBold"
          style={[styles.itemText, { width: '100%' }]}
        >
          يرجى اختيار الرواية
        </ThemedText>
        <Pressable style={[{ width: '100%' }]} accessibilityRole="radiogroup">
          <SegmentedControl
            options={riwayaOptions}
            initialSelectedIndex={RiwayaByIndice(mushafRiwayaValue)}
            activeColor={primaryColor}
            textColor={primaryColor}
            onSelectionChange={(index: number) => {
              console.log('Selected Riwaya Index:', index);
              console.log('Selected Riwaya Value:', RiwayaByValue(index));
              const selectedRiwaya = RiwayaByValue(index);
              setMushafRiwayaValue(selectedRiwaya);
            }}
          />
        </Pressable>
      </ThemedView>
    </ThemedView>
  );
}
const styles = StyleSheet.create({
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
    paddingHorizontal: 20,
    margin: 10,
  },
  contentContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    maxWidth: 600,
  },
  itemText: {
    fontSize: 20,
    fontFamily: 'Tajawal_700Bold',
    paddingVertical: 8,
    paddingHorizontal: 5,
    textAlign: 'center',
    marginBottom: 20,
  },
});
