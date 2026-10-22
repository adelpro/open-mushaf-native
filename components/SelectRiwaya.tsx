import React, { useCallback } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Feather } from '@expo/vector-icons';
import { useAtom } from 'jotai/react';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RIWAYA_ARABIC_LABEL, riwayaOptions } from '@/constants';
import { useNotification } from '@/Context/NotificationProvider';
import {
  useColors,
  useDownloadProgress,
  useDownloadStatus,
  useMushafDownload,
} from '@/hooks';
import { downloadedRiwayat, mushafRiwaya } from '@/jotai/atoms';
import { resourceKeyOf } from '@/utils/downloads';
import { getRiwayaByIndex } from '@/utils/riwayaHelper';

import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

/**
 * A setting component integrating `SegmentedControl` to manipulate
 * the active `mushafRiwaya` atom.
 *
 * The selector itself **does not gate the switch on offline
 * status**. Picking a non-downloaded riwaya just sets the active
 * value — the mashaf page falls back to the CDN on disk miss
 * (see the PNG page cache), so the user can read online. To
 * actually take content offline, the user navigates to the
 * Downloads page (via the hub in `app/(tabs)/(more)/index.tsx`)
 * which is the single source of truth for download actions.
 *
 * @returns An interactive UI block explicitly for mutating the
 *   global Riwaya state.
 */
export function SelectRiwaya() {
  const [mushafRiwayaValue, setMushafRiwayaValue] = useAtom(mushafRiwaya);
  const [, setDownloadedRiwayat] = useAtom(downloadedRiwayat);
  const { primaryColor, iconColor } = useColors();
  const { downloadedRiwayaList, riwayaIsDownloaded } = useDownloadStatus();
  const { notify } = useNotification();
  const { startRiwaya, cancel: cancelDownload } = useMushafDownload();
  const progress =
    useDownloadProgress()[
      resourceKeyOf({ kind: 'mushaf', riwaya: mushafRiwayaValue })
    ];
  const isDownloading = progress?.status === 'downloading';
  const isDownloaded = riwayaIsDownloaded(mushafRiwayaValue);

  const handleDownload = useCallback(async () => {
    if (isDownloading) {
      cancelDownload();
      return;
    }
    try {
      await startRiwaya(mushafRiwayaValue);
      setDownloadedRiwayat((previous) =>
        previous.includes(mushafRiwayaValue)
          ? previous
          : [...previous, mushafRiwayaValue],
      );
      notify(
        `تم تنزيل ${RIWAYA_ARABIC_LABEL[mushafRiwayaValue]} بنجاح`,
        `select-riwaya-${mushafRiwayaValue}-done`,
        'success',
      );
    } catch {
      notify(
        `فشل تنزيل ${RIWAYA_ARABIC_LABEL[mushafRiwayaValue]} — حاول مرة أخرى`,
        `select-riwaya-${mushafRiwayaValue}-error`,
        'error',
      );
    }
  }, [
    cancelDownload,
    isDownloading,
    mushafRiwayaValue,
    notify,
    setDownloadedRiwayat,
    startRiwaya,
  ]);

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
          <View style={styles.riwayaList} accessibilityRole="radiogroup">
            {riwayaOptions.map((option, index) => {
              const riwaya = getRiwayaByIndex(index);
              const isActive = riwaya === mushafRiwayaValue;

              return (
                <Pressable
                  key={riwaya}
                  accessibilityLabel={option}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: isActive }}
                  onPress={() => setMushafRiwayaValue(riwaya)}
                  style={({ pressed }) => [
                    styles.riwayaCard,
                    {
                      borderColor: isActive ? primaryColor : iconColor + '44',
                      backgroundColor: isActive
                        ? primaryColor + '12'
                        : iconColor + '08',
                      opacity: pressed ? 0.75 : isActive ? 1 : 0.55,
                    },
                  ]}
                >
                  <ThemedText
                    type={isActive ? 'defaultSemiBold' : 'default'}
                    style={[
                      styles.riwayaCardText,
                      { color: isActive ? primaryColor : iconColor },
                    ]}
                  >
                    {option}
                  </ThemedText>
                  <Feather
                    name={isActive ? 'check-circle' : 'circle'}
                    size={18}
                    color={isActive ? primaryColor : iconColor}
                  />
                </Pressable>
              );
            })}
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              isDownloading
                ? 'إلغاء تنزيل الرواية'
                : isDownloaded
                  ? 'الرواية محمّلة'
                  : `تنزيل ${RIWAYA_ARABIC_LABEL[mushafRiwayaValue]}`
            }
            disabled={isDownloaded && !isDownloading}
            onPress={handleDownload}
            style={({ pressed }) => [
              styles.downloadButton,
              {
                borderColor: isDownloading ? iconColor : primaryColor,
                backgroundColor: isDownloading
                  ? iconColor + '18'
                  : primaryColor + '14',
                opacity: pressed ? 0.7 : isDownloaded ? 0.65 : 1,
              },
            ]}
          >
            <Feather
              name={isDownloading ? 'x' : isDownloaded ? 'check' : 'download'}
              size={16}
              color={isDownloading ? iconColor : primaryColor}
            />
            <ThemedText
              style={[
                styles.downloadButtonText,
                { color: isDownloading ? iconColor : primaryColor },
              ]}
            >
              {isDownloading
                ? `إلغاء التنزيل${progress?.total ? ` ${progress.downloaded}/${progress.total}` : ''}`
                : isDownloaded
                  ? 'الرواية محمّلة دون اتصال'
                  : 'تنزيل الرواية للقراءة دون اتصال'}
            </ThemedText>
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
    alignItems: 'center',
    width: '100%',
    maxWidth: 600,
    flexDirection: 'column',
  },
  itemText: {
    fontSize: 20,
    fontFamily: 'Tajawal_700Bold',
    paddingVertical: 8,
    paddingHorizontal: 5,
    textAlign: 'center',
    marginBottom: 20,
  },
  riwayaList: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
  },
  riwayaCard: {
    width: '48%',
    maxWidth: 220,
    aspectRatio: 1,
    minWidth: 0,
    padding: 12,
    borderWidth: 2,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  riwayaCardText: {
    width: '100%',
    fontSize: 17,
    textAlign: 'center',
  },
  downloadButton: {
    minHeight: 42,
    width: '100%',
    maxWidth: 420,
    marginTop: 16,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
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
  downloadButtonText: {
    fontSize: 14,
    textAlign: 'center',
  },
});
