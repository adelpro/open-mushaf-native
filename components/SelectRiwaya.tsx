import React from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { useRecoilState } from 'recoil';

import { useColors } from '@/hooks/useColors';
import { MushafRiwaya } from '@/recoil/atom';

import SegmentedControl from './SegmentControl';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

const riwayaOptions = ['ورش', 'حفص'];

export default function SelectRiwaya() {
  const [mushafRiwayaValue, setMushafRiwayaValue] =
    useRecoilState(MushafRiwaya);
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
            initialSelectedIndex={mushafRiwayaValue}
            activeColor={primaryColor}
            textColor={primaryColor}
            onSelectionChange={(index: number) => {
              setMushafRiwayaValue(index);
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
    fontFamily: 'Amiri_700Bold',
    paddingVertical: 8,
    paddingHorizontal: 5,
    textAlign: 'center',
    marginBottom: 20,
  },
});
