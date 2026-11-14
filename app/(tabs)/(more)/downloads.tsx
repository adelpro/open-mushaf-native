import React from 'react';
import { Alert, Platform, Pressable, ScrollView, View } from 'react-native';

import { Feather } from '@expo/vector-icons';
import { Stack } from 'expo-router';

import { ThemedText, ThemedView } from '@/components';
import { RiwayaCard, TafseerCard } from '@/components/downloads/DownloadCards';
import { styles } from '@/components/downloads/styles';
import { useDownloadsScreen } from '@/components/downloads/useDownloadsScreen';
import { getRiwayaLabel, RIWAYAT_LIST } from '@/constants';
import { getTafseerLabel, TAFSEERS_LIST } from '@/constants/TafseerCdn';
import { formatBytes } from '@/utils/downloads';
import { resourceKeyOf } from '@/utils/downloads/types';

function confirmRemoval(
  title: string,
  message: string,
  remove: () => void,
): void {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined' && window.confirm(title + '\n' + message))
      remove();
    return;
  }
  Alert.alert(title, message, [
    { text: 'إلغاء', style: 'cancel' },
    { text: 'حذف', style: 'destructive', onPress: remove },
  ]);
}

const RIWAYAS = [...RIWAYAT_LIST];
const TAFSEER_KEYS = [...TAFSEERS_LIST];

type RowStatus = 'downloading' | 'done' | 'pending';

const STATUS_RANK: Record<RowStatus, number> = {
  downloading: 0,
  done: 1,
  pending: 2,
};

function sortByStatus<T extends { status: RowStatus }>(items: T[]): T[] {
  return [...items].sort(
    (a, b) =>
      Object.keys(STATUS_RANK).indexOf(a.status) -
      Object.keys(STATUS_RANK).indexOf(b.status),
  );
}

function CollapsibleSection({
  title,
  totalCount,
  downloadedCount,
  expanded,
  onToggle,
  children,
}: {
  title: string;
  totalCount: number;
  downloadedCount: number;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <>
      <Pressable
        onPress={onToggle}
        style={styles.sectionHeader}
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        accessibilityLabel={`${title} ${expanded ? 'مفتوحة' : 'مطوية'}`}
      >
        <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
          {title}
        </ThemedText>
        <View style={styles.sectionHeaderMeta}>
          <ThemedText style={styles.sectionCount}>
            {downloadedCount}/{totalCount}
          </ThemedText>
          <Feather
            name={expanded ? 'chevron-down' : 'chevron-up'}
            size={18}
            color={'rgba(127,127,127,0.7)'}
          />
        </View>
      </Pressable>
      {expanded && children}
    </>
  );
}

type DownloadsModel = ReturnType<typeof useDownloadsScreen>;

export default function DownloadsScreen() {
  const model = useDownloadsScreen();
  return <DownloadsContent {...model} />;
}

function DownloadsContent(model: DownloadsModel) {
  const { cardColor } = model;
  return (
    <>
      <Stack.Screen options={{ headerShown: true, title: 'التنزيلات' }} />
      <ScrollView
        style={{ flex: 1, backgroundColor: cardColor }}
        contentContainerStyle={styles.scroll}
      >
        <StorageSummary {...model} />

        <RiwayaDownloads {...model} />

        <TafseerDownloads {...model} />
      </ScrollView>
    </>
  );
}

function StorageSummary(model: DownloadsModel) {
  const {
    primaryColor,
    cardColor,
    textColor,
    downloaded,
    downloadedTafseersList,
    totalBytes,
    quotaBytes,
    quotaFraction,
  } = model;
  return (
    <ThemedView
      style={[
        styles.summaryCard,
        { backgroundColor: cardColor, borderColor: textColor + '22' },
      ]}
    >
      <ThemedText type="defaultSemiBold">السعة المستخدمة</ThemedText>
      <ThemedText style={styles.summaryBytes}>
        {formatBytes(totalBytes)}
      </ThemedText>
      {Platform.OS === 'web' && quotaBytes ? (
        <>
          <ThemedText style={styles.summaryMeta}>
            من أصل {formatBytes(quotaBytes)} ({Math.round(quotaFraction * 100)}
            %)
          </ThemedText>
          <View style={styles.summaryBar}>
            <View
              style={[
                styles.summaryBarFill,
                {
                  width: `${quotaFraction * 100}%`,
                  backgroundColor:
                    quotaFraction > 0.9
                      ? '#d23f3f'
                      : quotaFraction > 0.7
                        ? '#d29c3f'
                        : primaryColor,
                },
              ]}
            />
          </View>
        </>
      ) : null}
      <ThemedText style={styles.summaryMeta}>
        {downloadedTafseersList.length} تفسير · {downloaded.length} رواية
      </ThemedText>
    </ThemedView>
  );
}

function RiwayaDownloads(model: DownloadsModel) {
  const {
    primaryColor,
    dangerColor,
    textColor,
    iconColor,
    downloaded,
    progressMap,
    rows,
    riwayaSectionExpanded,
    setRiwayaSectionExpanded,
    handleDownload,
    handleCancel,
    handleDelete,
  } = model;
  return (
    <CollapsibleSection
      title="الروايات"
      totalCount={RIWAYAS.length}
      downloadedCount={downloaded.length}
      expanded={riwayaSectionExpanded}
      onToggle={() => {
        setRiwayaSectionExpanded((v) => !v);
      }}
    >
      {sortByStatus(
        rows.map((row) => {
          const riwayaId = resourceKeyOf({
            kind: 'mushaf',
            riwaya: row.riwaya,
          });
          const progress = Object.entries(progressMap).find(
            ([key]) => key === riwayaId,
          )?.[1];
          const isInProgress =
            progress?.status === 'downloading' || progress?.status === 'queued';
          const isDone = downloaded.includes(row.riwaya);
          const status: RowStatus = isInProgress
            ? 'downloading'
            : isDone
              ? 'done'
              : 'pending';
          return { id: row.riwaya, row, status, isDone, isInProgress };
        }),
      ).map(({ id, row, isDone, isInProgress }) => {
        const riwayaId = resourceKeyOf({ kind: 'mushaf', riwaya: id });
        const progress = Object.entries(progressMap).find(
          ([key]) => key === riwayaId,
        )?.[1];
        return (
          <RiwayaCard
            key={row.riwaya}
            row={row}
            isDone={isDone}
            isDownloading={isInProgress}
            progress={progress}
            primaryColor={primaryColor}
            dangerColor={dangerColor}
            textColor={textColor}
            iconColor={iconColor}
            onDownload={() => {
              void handleDownload(row.riwaya);
            }}
            onCancel={handleCancel}
            onDelete={() => {
              confirmRemoval(
                `حذف ${getRiwayaLabel(row.riwaya)}`,
                `سيتم حذف ${row.pagesDownloaded} صفحة من ذاكرة الجهاز. هل تريد المتابعة؟`,
                () => {
                  void handleDelete(row.riwaya);
                },
              );
            }}
          />
        );
      })}

      <ThemedText style={styles.footnote}>
        تنزيل الرواية يجعل صفحاتها متاحة للقراءة دون اتصال بالإنترنت.
      </ThemedText>
    </CollapsibleSection>
  );
}

function TafseerDownloads(model: DownloadsModel) {
  const {
    primaryColor,
    dangerColor,
    textColor,
    downloadedTafseersList,
    progressMap,
    tafseerRows,
    tafseerSectionExpanded,
    setTafseerSectionExpanded,
    handleTafseerDownload,
    handleTafseerCancel,
    handleTafseerDelete,
  } = model;
  return (
    <CollapsibleSection
      title="التفاسير"
      totalCount={TAFSEER_KEYS.length}
      downloadedCount={downloadedTafseersList.length}
      expanded={tafseerSectionExpanded}
      onToggle={() => {
        setTafseerSectionExpanded((v) => !v);
      }}
    >
      {sortByStatus(
        tafseerRows.map((row) => {
          const tafseerId = resourceKeyOf({
            kind: 'tafseer',
            key: row.key,
          });
          const progress = Object.entries(progressMap).find(
            ([key]) => key === tafseerId,
          )?.[1];
          const isInProgress =
            progress?.status === 'downloading' || progress?.status === 'queued';
          const isDone = row.cached;
          const status: RowStatus = isInProgress
            ? 'downloading'
            : isDone
              ? 'done'
              : 'pending';
          return { id: row.key, row, status };
        }),
      ).map(({ row }) => {
        const tafseerId = resourceKeyOf({ kind: 'tafseer', key: row.key });
        const progress = Object.entries(progressMap).find(
          ([key]) => key === tafseerId,
        )?.[1];
        const isInProgress =
          progress?.status === 'downloading' || progress?.status === 'queued';
        return (
          <TafseerCard
            key={row.key}
            row={row}
            isDownloading={isInProgress}
            progress={progress}
            primaryColor={primaryColor}
            dangerColor={dangerColor}
            textColor={textColor}
            onDownload={() => {
              void handleTafseerDownload(row.key);
            }}
            onCancel={handleTafseerCancel}
            onDelete={() => {
              confirmRemoval(
                `حذف ${getTafseerLabel(row.key)}`,
                `سيتم حذف ملف التفسير من ذاكرة الجهاز. هل تريد المتابعة؟`,
                () => {
                  void handleTafseerDelete(row.key);
                },
              );
            }}
          />
        );
      })}

      <ThemedText style={styles.footnote}>
        تنزيل التفسير يجعله متاحًا دون اتصال عند الضغط المطوّل على أي آية.
      </ThemedText>
    </CollapsibleSection>
  );
}
