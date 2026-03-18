import React from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { useAtom } from 'jotai/react';
import { SafeAreaView } from 'react-native-safe-area-context';

import { riwayaOptions } from '@/constants';
import { useColors } from '@/hooks';
import { mushafRiwaya } from '@/jotai/atoms';
import { RiwayaByIndice, RiwayaByValue } from '@/utils';

import { SegmentedControl } from './SegmentControl';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

/**
 * A setting component integrating `SegmentedControl` to manipulate the active `mushafRiwaya` atom.
 *
 * @returns An interactive UI block explicitly for mutating the global Riwaya state.
 */
export function SelectRiwaya() {
  const [mushafRiwayaValue, setMushafRiwayaValue] = useAtom(mushafRiwaya);
  const { primaryColor } = useColors();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
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
                const selectedRiwaya = RiwayaByValue(index);
                setMushafRiwayaValue(selectedRiwaya);
              }}
            />
          </Pressable>
        </ThemedView>
      </ThemedView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  safeArea: {
    width: '100%',
    height: '100%',
    paddingHorizontal: 20,
    margin: 10,
  },
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
    fontFamily: 'Tajawal_700Bold',
    paddingVertical: 8,
    paddingHorizontal: 5,
    textAlign: 'center',
    marginBottom: 20,
  },
});
