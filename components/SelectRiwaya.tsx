import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Feather } from '@expo/vector-icons';
import { useAtom } from 'jotai/react';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RIWAYA_ARABIC_LABEL, riwayaOptions } from '@/constants';
import { useColors, useDownloadStatus } from '@/hooks';
import { mushafRiwaya } from '@/jotai/atoms';
import { getRiwayaByIndex, getRiwayaIndex } from '@/utils/riwayaHelper';

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
  const { primaryColor, iconColor } = useColors();
  const { downloadedRiwayaList } = useDownloadStatus();

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
              initialSelectedIndex={getRiwayaIndex(mushafRiwayaValue)}
              activeColor={primaryColor}
              textColor={primaryColor}
              onSelectionChange={(index: number) => {
                const selectedRiwaya = getRiwayaByIndex(index);
                setMushafRiwayaValue(selectedRiwaya);
              }}
            />
          </Pressable>
          <View style={styles.downloadedHintRow}>
            <Feather
              name={downloadedRiwayaList.length > 0 ? 'check-circle' : 'info'}
              size={13}
              color={
                downloadedRiwayaList.length > 0
                  ? primaryColor
                  : iconColor + '99'
              }
            />
            <ThemedText
              style={[
                styles.downloadedHint,
                {
                  color:
                    downloadedRiwayaList.length > 0
                      ? iconColor + '99'
                      : iconColor + '66',
                },
              ]}
            >
              {downloadedRiwayaList.length > 0
                ? `محمّل: ${downloadedRiwayaList.map((r) => RIWAYA_ARABIC_LABEL[r]).join(' · ')}`
                : 'لا توجد روايات محمّلة — افتح الإعدادات > التنزيلات'}
            </ThemedText>
          </View>
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
  downloadedHintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 10,
  },
  downloadedHint: {
    fontSize: 12,
    textAlign: 'center',
  },
});
