import { useCallback } from 'react';
import { Pressable, View } from 'react-native';

import { Feather } from '@expo/vector-icons';
import { useAtom } from 'jotai/react';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getRiwayaLabel, riwayaOptions } from '@/constants';
import { useNotification } from '@/Context/NotificationProvider';
import {
  useColors,
  useDownloadProgress,
  useDownloadStatus,
  useMushafDownload,
} from '@/hooks';
import { mushafRiwaya } from '@/jotai/atoms';
import { resourceKeyOf } from '@/utils/downloads';
import { getRiwayaByIndex } from '@/utils/riwayaHelper';

import { styles } from './SelectRiwaya.styles';
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
  const { primaryColor, iconColor } = useColors();
  const { downloadedRiwayaList, riwayaIsDownloaded } = useDownloadStatus();
  const { notify } = useNotification();
  const { startRiwaya, cancel: cancelDownload } = useMushafDownload();
  const progressMap = useDownloadProgress();
  const resourceId = resourceKeyOf({
    kind: 'mushaf',
    riwaya: mushafRiwayaValue,
  });
  const progress = Object.entries(progressMap).find(
    ([key]) => key === resourceId,
  )?.[1];
  const isDownloading =
    progress?.status === 'downloading' || progress?.status === 'queued';
  const isDownloaded = riwayaIsDownloaded(mushafRiwayaValue);

  const handleDownload = useCallback(async () => {
    if (isDownloading) {
      cancelDownload();
      return;
    }
    try {
      await startRiwaya(mushafRiwayaValue);
      notify(
        `تم تنزيل ${getRiwayaLabel(mushafRiwayaValue)} بنجاح`,
        `select-riwaya-${mushafRiwayaValue}-done`,
        'success',
      );
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') return;
      notify(
        `فشل تنزيل ${getRiwayaLabel(mushafRiwayaValue)} — حاول مرة أخرى`,
        `select-riwaya-${mushafRiwayaValue}-error`,
        'error',
      );
    }
  }, [cancelDownload, isDownloading, mushafRiwayaValue, notify, startRiwaya]);

  function renderRiwayaList() {
    return (
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
              onPress={() => {
                setMushafRiwayaValue(riwaya);
              }}
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
    );
  }

  function getDownloadButtonLabels() {
    const downloadButtonLabel = isDownloading
      ? 'إلغاء تنزيل الرواية'
      : isDownloaded
        ? 'الرواية محمّلة'
        : `تنزيل ${getRiwayaLabel(mushafRiwayaValue)}`;
    const downloadButtonText = isDownloading
      ? `إلغاء التنزيل${progress.total ? ` ${progress.downloaded}/${progress.total}` : ''}`
      : isDownloaded
        ? 'الرواية محمّلة دون اتصال'
        : 'تنزيل الرواية للقراءة دون اتصال';
    return { downloadButtonLabel, downloadButtonText };
  }
  const { downloadButtonLabel, downloadButtonText } = getDownloadButtonLabels();
  function renderDownloadButton() {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={downloadButtonLabel}
        disabled={isDownloaded && !isDownloading}
        onPress={() => {
          void handleDownload();
        }}
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
          {downloadButtonText}
        </ThemedText>
      </Pressable>
    );
  }

  function renderContainer() {
    function renderContentContainer() {
      function renderDownloadedHintRow() {
        function renderDownloadedHint() {
          return (
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
                ? `محمّل: ${downloadedRiwayaList.map((r) => getRiwayaLabel(r)).join(' · ')}`
                : 'لا توجد روايات محمّلة — افتح الإعدادات > التنزيلات'}
            </ThemedText>
          );
        }
        return (
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
            {renderDownloadedHint()}
          </View>
        );
      }
      return (
        <ThemedView style={styles.contentContainer}>
          <ThemedText
            type="defaultSemiBold"
            style={[styles.itemText, { width: '100%' }]}
          >
            يرجى اختيار الرواية
          </ThemedText>
          {renderRiwayaList()}
          {renderDownloadButton()}
          {renderDownloadedHintRow()}
        </ThemedView>
      );
    }
    return (
      <ThemedView style={styles.container}>
        {renderContentContainer()}
      </ThemedView>
    );
  }
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {renderContainer()}
    </SafeAreaView>
  );
}
