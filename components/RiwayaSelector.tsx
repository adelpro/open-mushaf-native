import React from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Feather } from '@expo/vector-icons';

import { ThemedText, ThemedView } from '@/components';
import { RIWAYA_ARABIC_LABEL } from '@/constants';
import { useColors, useDownloadStatus } from '@/hooks';
import { Riwaya } from '@/types';
import { RIWAYAT_LIST } from '@/utils/riwayaHelper';

type RiwayaSelectorProps = {
  visible: boolean;
  onClose: () => void;
  currentRiwaya: Riwaya;
  onSelect: (riwaya: Riwaya) => void;
};

export function RiwayaSelector({
  visible,
  onClose,
  currentRiwaya,
  onSelect,
}: RiwayaSelectorProps) {
  const { cardColor, primaryColor, iconColor } = useColors();
  const { riwayaIsDownloaded } = useDownloadStatus();

  // Sort by Arabic label (optional)
  const sortedRiwayat = React.useMemo(() => {
    return [...RIWAYAT_LIST].sort((a, b) =>
      RIWAYA_ARABIC_LABEL[a].localeCompare(RIWAYA_ARABIC_LABEL[b]),
    );
  }, []);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable onPress={onClose} style={{ flex: 1 }}>
        <View style={styles.overlay}>
          <Pressable onPress={() => {}} style={styles.modalWrapper}>
            <ThemedView style={[styles.modal, { backgroundColor: cardColor }]}>
              <View style={styles.header}>
                <ThemedText type="title" style={styles.title}>
                  اختر الرواية
                </ThemedText>
                <Pressable onPress={onClose} accessibilityLabel="إغلاق">
                  <Feather name="x" size={24} color={iconColor} />
                </Pressable>
              </View>

              <ScrollView style={styles.list}>
                {sortedRiwayat.map((riwaya) => {
                  const isSelected = riwaya === currentRiwaya;
                  const isDownloaded = riwayaIsDownloaded(riwaya);
                  // Dim non-downloaded riwayat (offline-unready) so
                  // users see at a glance which is safe to read on
                  // the road or in the mosque.
                  const isDimmed = !isDownloaded && !isSelected;
                  return (
                    <Pressable
                      key={riwaya}
                      style={[
                        styles.item,
                        isSelected && {
                          backgroundColor: primaryColor + '20',
                        },
                        isDimmed && styles.itemDimmed,
                      ]}
                      onPress={() => onSelect(riwaya)}
                      accessibilityRole="radio"
                      accessibilityState={{ checked: isSelected }}
                    >
                      <View style={styles.itemLabelRow}>
                        <Feather
                          name={isDownloaded ? 'check-circle' : 'download'}
                          size={14}
                          color={isDownloaded ? primaryColor : iconColor + '66'}
                          style={styles.itemIcon}
                        />
                        <ThemedText
                          style={[
                            styles.itemText,
                            isSelected && { color: primaryColor },
                          ]}
                        >
                          {RIWAYA_ARABIC_LABEL[riwaya]}
                        </ThemedText>
                      </View>
                      {isSelected ? (
                        <Feather name="check" size={20} color={primaryColor} />
                      ) : null}
                    </Pressable>
                  );
                })}
              </ScrollView>
            </ThemedView>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalWrapper: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    maxWidth: 400,
  },
  modal: {
    width: '100%',
    borderRadius: 12,
    padding: 20,
    maxHeight: '80%', // Keeps your scrolling fix intact
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  list: {
    flexGrow: 1,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginBottom: 4,
  },
  itemDimmed: {
    opacity: 0.5,
  },
  itemLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemIcon: {
    marginEnd: 8,
  },
  itemText: {
    fontSize: 18,
  },
});
