import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import { Feather } from '@expo/vector-icons';
import { Stack, useFocusEffect } from 'expo-router';
import { useAtom, useAtomValue, useSetAtom } from 'jotai/react';

import { ThemedText, ThemedView } from '@/components';
import { RIWAYA_ARABIC_LABEL, RIWAYAT_LIST } from '@/constants';
import {
  TAFSEER_ARABIC_LABEL,
  TafseerKey,
  TAFSEERS_LIST,
} from '@/constants/TafseerCdn';
import { useNotification } from '@/Context/NotificationProvider';
import {
  useColors,
  useDownloadProgress,
  useRiwayaDownload,
  useTafseerDownload,
} from '@/hooks';
import {
  downloadedRiwaya,
  downloadedTafseers,
  mushafRiwaya,
} from '@/jotai/atoms';
import type { Riwaya } from '@/types';
import { getRiwayaBundleBytes } from '@/utils/api/qurani/cache';
import {
  deleteRiwaya,
  deleteTafseer,
  formatBytes,
  getStorageSnapshot,
  getTafseerFileSizeBytes,
  isRiwayaBundleCached,
  isTafseerCached,
  NARRATION_SIZE_ESTIMATE_BYTES,
  resourceKeyOf,
} from '@/utils/downloads';

const TAFSEER_KEYS = [...TAFSEERS_LIST];

interface TafseerRow {
  key: TafseerKey;
  cached: boolean;
  bytes: number;
}

interface RiwayaRow {
  riwaya: Riwaya;
  bytes: number;
  cached: boolean;
  /** Estimated bytes for the download (~2 MB / riwaya bundle). */
  estimatedBytes: number;
}

type RowStatus = 'downloading' | 'done' | 'pending';

const STATUS_RANK: Record<RowStatus, number> = {
  downloading: 0,
  done: 1,
  pending: 2,
};

function sortByStatus<T extends { status: RowStatus }>(items: T[]): T[] {
  return [...items].sort(
    (a, b) => STATUS_RANK[a.status] - STATUS_RANK[b.status],
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
        accessibilityLabel={`${title} ${expanded ? 'مطوية' : 'مفتوحة'}`}
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

export default function DownloadsScreen() {
  const { notify } = useNotification();
  const { primaryColor, dangerColor, cardColor, textColor, iconColor } =
    useColors();

  const [downloadedRiwayaList, setDownloadedRiwaya] = useAtom(downloadedRiwaya);
  const [downloadedTafseersList, setDownloadedTafseers] =
    useAtom(downloadedTafseers);
  const currentRiwaya = useAtomValue(mushafRiwaya);
  const setCurrentRiwaya = useSetAtom(mushafRiwaya);

  const progressMap = useDownloadProgress();
  const { startRiwaya, cancel: cancelRiwaya, isBusy } = useRiwayaDownload();
  const { startTafseer, cancel: cancelTafseer } = useTafseerDownload();

  const [riwayaRows, setRiwayaRows] = useState<RiwayaRow[]>([]);
  const [tafseerRows, setTafseerRows] = useState<TafseerRow[]>([]);
  const [totalBytes, setTotalBytes] = useState(0);
  const [quotaBytes, setQuotaBytes] = useState<number | null>(null);
  const [busyRiwaya, setBusyRiwaya] = useState<Riwaya | null>(null);
  const [busyTafseer, setBusyTafseer] = useState<TafseerKey | null>(null);
  const [riwayaSectionExpanded, setRiwayaSectionExpanded] = useState(true);
  const [tafseerSectionExpanded, setTafseerSectionExpanded] = useState(true);

  const refreshSizes = useCallback(async () => {
    const nextRiwayas: RiwayaRow[] = await Promise.all(
      RIWAYAT_LIST.map(async (riwaya) => {
        const cached = await isRiwayaBundleCached(riwaya);
        const bytes = cached ? await getRiwayaBundleBytes(riwaya) : 0;
        return {
          riwaya,
          bytes,
          cached,
          estimatedBytes: NARRATION_SIZE_ESTIMATE_BYTES,
        };
      }),
    );
    setRiwayaRows(nextRiwayas);

    const nextTafseers: TafseerRow[] = await Promise.all(
      TAFSEER_KEYS.map(async (key) => ({
        key,
        cached: await isTafseerCached(key),
        bytes: await getTafseerFileSizeBytes(key),
      })),
    );
    setTafseerRows(nextTafseers);

    const snap = await getStorageSnapshot();
    setTotalBytes(snap.totalBytes);
    if (Platform.OS === 'web' && typeof navigator !== 'undefined') {
      const storage = (
        navigator as Navigator & {
          storage?: { estimate?: () => Promise<StorageEstimate> };
        }
      ).storage;
      if (storage?.estimate) {
        try {
          const est = await storage.estimate();
          setQuotaBytes(typeof est.quota === 'number' ? est.quota : null);
        } catch {
          // ignore
        }
      }
    }
  }, []);

  const quotaFraction =
    quotaBytes && quotaBytes > 0 ? Math.min(1, totalBytes / quotaBytes) : 0;

  useFocusEffect(
    useCallback(() => {
      refreshSizes();
    }, [refreshSizes]),
  );

  useEffect(() => {
    let anyDone = false;
    for (const key of Object.keys(progressMap)) {
      if (progressMap[key as keyof typeof progressMap]?.status === 'done') {
        anyDone = true;
        break;
      }
    }
    if (anyDone) refreshSizes();
  }, [progressMap, refreshSizes]);

  const handleRiwayaDownload = useCallback(
    async (riwaya: Riwaya) => {
      setBusyRiwaya(riwaya);
      try {
        await startRiwaya(riwaya);
        setDownloadedRiwaya((prev) =>
          prev.includes(riwaya) ? prev : [...prev, riwaya],
        );
        // Switch the active riwaya so the user can immediately read.
        setCurrentRiwaya(riwaya);
        notify(
          `تم تنزيل ${RIWAYA_ARABIC_LABEL[riwaya]} بنجاح`,
          `dl-riwaya-${riwaya}-done`,
          'success',
        );
      } catch {
        notify(
          `فشل تنزيل ${RIWAYA_ARABIC_LABEL[riwaya]} — حاول مرة أخرى`,
          `dl-riwaya-${riwaya}-error`,
          'error',
        );
      } finally {
        setBusyRiwaya(null);
        refreshSizes();
      }
    },
    [startRiwaya, setDownloadedRiwaya, setCurrentRiwaya, notify, refreshSizes],
  );

  const handleRiwayaCancel = useCallback(() => {
    cancelRiwaya();
    setBusyRiwaya(null);
    refreshSizes();
  }, [cancelRiwaya, refreshSizes]);

  const handleRiwayaDelete = useCallback(
    async (riwaya: Riwaya) => {
      try {
        await deleteRiwaya(riwaya);
        setDownloadedRiwaya((prev) => prev.filter((r) => r !== riwaya));
        notify(
          `تم حذف تنزيل ${RIWAYA_ARABIC_LABEL[riwaya]}`,
          `dl-riwaya-${riwaya}-del`,
          'neutral',
        );
      } catch {
        notify(`تعذّر الحذف`, `dl-riwaya-${riwaya}-del-error`, 'error');
      } finally {
        refreshSizes();
      }
    },
    [setDownloadedRiwaya, notify, refreshSizes],
  );

  const handleTafseerDownload = useCallback(
    async (key: TafseerKey) => {
      setBusyTafseer(key);
      try {
        await startTafseer(key);
        setDownloadedTafseers((prev) =>
          prev.includes(key) ? prev : [...prev, key],
        );
        notify(
          `تم تنزيل ${TAFSEER_ARABIC_LABEL[key]} بنجاح`,
          `dl-tafseer-${key}-done`,
          'success',
        );
      } catch {
        notify(
          `فشل تنزيل ${TAFSEER_ARABIC_LABEL[key]} — حاول مرة أخرى`,
          `dl-tafseer-${key}-error`,
          'error',
        );
      } finally {
        setBusyTafseer(null);
        refreshSizes();
      }
    },
    [startTafseer, setDownloadedTafseers, notify, refreshSizes],
  );

  const handleTafseerCancel = useCallback(() => {
    cancelTafseer();
    setBusyTafseer(null);
    refreshSizes();
  }, [cancelTafseer, refreshSizes]);

  const handleTafseerDelete = useCallback(
    async (key: TafseerKey) => {
      try {
        await deleteTafseer(key);
        setDownloadedTafseers((prev) => prev.filter((k) => k !== key));
        notify(
          `تم حذف تنزيل ${TAFSEER_ARABIC_LABEL[key]}`,
          `dl-tafseer-${key}-del`,
          'neutral',
        );
      } catch {
        notify(`تعذّر الحذف`, `dl-tafseer-${key}-del-error`, 'error');
      } finally {
        refreshSizes();
      }
    },
    [setDownloadedTafseers, notify, refreshSizes],
  );

  return (
    <>
      <Stack.Screen options={{ headerShown: true, title: 'التنزيلات' }} />
      <ScrollView
        style={{ flex: 1, backgroundColor: cardColor }}
        contentContainerStyle={styles.scroll}
      >
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
                من أصل {formatBytes(quotaBytes)} (
                {Math.round(quotaFraction * 100)}%)
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
            {downloadedTafseersList.length} تفسير ·{' '}
            {downloadedRiwayaList.length} رواية
          </ThemedText>
        </ThemedView>

        <CollapsibleSection
          title="الروايات"
          totalCount={RIWAYAT_LIST.length}
          downloadedCount={downloadedRiwayaList.length}
          expanded={riwayaSectionExpanded}
          onToggle={() => setRiwayaSectionExpanded((v) => !v)}
        >
          {sortByStatus(
            riwayaRows.map((row) => {
              const isInProgress =
                busyRiwaya === row.riwaya &&
                progressMap[
                  resourceKeyOf({ kind: 'riwaya', riwaya: row.riwaya })
                ]?.status === 'downloading';
              const isDone = downloadedRiwayaList.includes(row.riwaya);
              const status: RowStatus = isInProgress
                ? 'downloading'
                : isDone
                  ? 'done'
                  : 'pending';
              return { id: row.riwaya, row, status, isDone, isInProgress };
            }),
          ).map(({ id, row, status, isDone, isInProgress }) => (
            <RiwayaCard
              key={id}
              row={row}
              isActive={currentRiwaya === id}
              isDone={isDone ?? false}
              isDownloading={isInProgress ?? false}
              primaryColor={primaryColor}
              dangerColor={dangerColor}
              textColor={textColor}
              iconColor={iconColor}
              onDownload={() => handleRiwayaDownload(row.riwaya)}
              onCancel={handleRiwayaCancel}
              onDelete={() =>
                Alert.alert(
                  'حذف الرواية',
                  `هل تريد حذف ${RIWAYA_ARABIC_LABEL[row.riwaya]}؟`,
                  [
                    { text: 'إلغاء', style: 'cancel' },
                    {
                      text: 'حذف',
                      style: 'destructive',
                      onPress: () => handleRiwayaDelete(row.riwaya),
                    },
                  ],
                )
              }
              status={status}
              anotherBusy={isBusy && !isInProgress}
            />
          ))}
        </CollapsibleSection>

        <CollapsibleSection
          title="التفاسير"
          totalCount={TAFSEER_KEYS.length}
          downloadedCount={downloadedTafseersList.length}
          expanded={tafseerSectionExpanded}
          onToggle={() => setTafseerSectionExpanded((v) => !v)}
        >
          {sortByStatus(
            tafseerRows.map((row) => {
              const isInProgress =
                busyTafseer === row.key &&
                progressMap[`tafseer:${row.key}` as const]?.status ===
                  'downloading';
              const isDone = downloadedTafseersList.includes(row.key);
              const status: RowStatus = isInProgress
                ? 'downloading'
                : isDone
                  ? 'done'
                  : 'pending';
              return { id: row.key, row, status, isDone, isInProgress };
            }),
          ).map(({ id, row, status, isDone, isInProgress }) => (
            <TafseerCard
              key={id}
              row={row}
              isDone={isDone ?? false}
              isDownloading={isInProgress ?? false}
              primaryColor={primaryColor}
              dangerColor={dangerColor}
              textColor={textColor}
              iconColor={iconColor}
              onDownload={() => handleTafseerDownload(row.key)}
              onCancel={handleTafseerCancel}
              onDelete={() =>
                Alert.alert(
                  'حذف التفسير',
                  `هل تريد حذف ${TAFSEER_ARABIC_LABEL[row.key]}؟`,
                  [
                    { text: 'إلغاء', style: 'cancel' },
                    {
                      text: 'حذف',
                      style: 'destructive',
                      onPress: () => handleTafseerDelete(row.key),
                    },
                  ],
                )
              }
              status={status}
            />
          ))}
        </CollapsibleSection>
      </ScrollView>
    </>
  );
}

function RiwayaCard({
  row,
  isActive,
  isDone,
  isDownloading,
  primaryColor,
  dangerColor,
  textColor,
  iconColor,
  onDownload,
  onCancel,
  onDelete,
  status,
  anotherBusy,
}: {
  row: RiwayaRow;
  isActive: boolean;
  isDone: boolean;
  isDownloading: boolean;
  primaryColor: string;
  dangerColor: string;
  textColor: string;
  iconColor: string;
  onDownload: () => void;
  onCancel: () => void;
  onDelete: () => void;
  status: RowStatus;
  anotherBusy: boolean;
}) {
  return (
    <View
      style={[
        styles.card,
        { backgroundColor: '#ffffff08', borderColor: textColor + '22' },
      ]}
    >
      <View style={styles.cardHeader}>
        <View style={{ flex: 1 }}>
          <View style={styles.riwayaHeaderRow}>
            <ThemedText type="defaultSemiBold" style={styles.riwayaName}>
              {RIWAYA_ARABIC_LABEL[row.riwaya]}
            </ThemedText>
            {isActive ? (
              <View
                style={[
                  styles.activeBadge,
                  { backgroundColor: primaryColor + '22' },
                ]}
              >
                <ThemedText
                  style={[styles.activeBadgeText, { color: primaryColor }]}
                >
                  الحالي
                </ThemedText>
              </View>
            ) : null}
          </View>
          <ThemedText style={styles.cardMeta}>
            {row.bytes > 0
              ? formatBytes(row.bytes)
              : `~ ${formatBytes(row.estimatedBytes)}`}
          </ThemedText>
        </View>
        <Feather
          name={status === 'done' ? 'check-circle' : 'circle'}
          size={20}
          color={status === 'done' ? primaryColor : iconColor}
        />
      </View>

      <View style={styles.cardActions}>
        {!isDownloading ? (
          <Pressable
            disabled={anotherBusy}
            onPress={isDone ? onDelete : onDownload}
            style={[
              styles.actionBtn,
              {
                backgroundColor: isDone
                  ? dangerColor + '22'
                  : anotherBusy
                    ? iconColor + '33'
                    : primaryColor,
              },
            ]}
            accessibilityRole="button"
            accessibilityLabel={
              isDone
                ? `حذف ${RIWAYA_ARABIC_LABEL[row.riwaya]}`
                : `تنزيل ${RIWAYA_ARABIC_LABEL[row.riwaya]}`
            }
          >
            <Feather
              name={isDone ? 'trash-2' : 'download'}
              size={16}
              color={isDone ? dangerColor : '#fff'}
            />
            <ThemedText
              style={[
                styles.actionLabel,
                {
                  color: isDone
                    ? dangerColor
                    : anotherBusy
                      ? iconColor
                      : '#fff',
                },
              ]}
            >
              {isDone ? 'حذف' : 'تنزيل'}
            </ThemedText>
          </Pressable>
        ) : (
          <Pressable
            onPress={onCancel}
            style={[styles.actionBtn, { backgroundColor: dangerColor }]}
            accessibilityRole="button"
            accessibilityLabel="إلغاء التنزيل"
          >
            <Feather name="x" size={16} color="#fff" />
            <ThemedText style={[styles.actionLabel, { color: '#fff' }]}>
              إلغاء
            </ThemedText>
          </Pressable>
        )}
      </View>
    </View>
  );
}

function TafseerCard({
  row,
  isDone,
  isDownloading,
  primaryColor,
  dangerColor,
  textColor,
  iconColor,
  onDownload,
  onCancel,
  onDelete,
  status,
}: {
  row: TafseerRow;
  isDone: boolean;
  isDownloading: boolean;
  primaryColor: string;
  dangerColor: string;
  textColor: string;
  iconColor: string;
  onDownload: () => void;
  onCancel: () => void;
  onDelete: () => void;
  status: RowStatus;
}) {
  return (
    <View
      style={[
        styles.card,
        { backgroundColor: '#ffffff08', borderColor: textColor + '22' },
      ]}
    >
      <View style={styles.cardHeader}>
        <View style={{ flex: 1 }}>
          <ThemedText type="defaultSemiBold">
            {TAFSEER_ARABIC_LABEL[row.key]}
          </ThemedText>
          <ThemedText style={styles.cardMeta}>
            {row.bytes > 0 ? formatBytes(row.bytes) : 'لم يتم التنزيل بعد'}
          </ThemedText>
        </View>
        <Feather
          name={status === 'done' ? 'check-circle' : 'circle'}
          size={20}
          color={status === 'done' ? primaryColor : iconColor}
        />
      </View>

      <View style={styles.cardActions}>
        {!isDownloading ? (
          <Pressable
            onPress={isDone ? onDelete : onDownload}
            style={[
              styles.actionBtn,
              {
                backgroundColor: isDone ? dangerColor + '22' : primaryColor,
              },
            ]}
            accessibilityRole="button"
            accessibilityLabel={
              isDone
                ? `حذف ${TAFSEER_ARABIC_LABEL[row.key]}`
                : `تنزيل ${TAFSEER_ARABIC_LABEL[row.key]}`
            }
          >
            <Feather
              name={isDone ? 'trash-2' : 'download'}
              size={16}
              color={isDone ? dangerColor : '#fff'}
            />
            <ThemedText
              style={[
                styles.actionLabel,
                { color: isDone ? dangerColor : '#fff' },
              ]}
            >
              {isDone ? 'حذف' : 'تنزيل'}
            </ThemedText>
          </Pressable>
        ) : (
          <Pressable
            onPress={onCancel}
            style={[styles.actionBtn, { backgroundColor: dangerColor }]}
            accessibilityRole="button"
            accessibilityLabel="إلغاء التنزيل"
          >
            <Feather name="x" size={16} color="#fff" />
            <ThemedText style={[styles.actionLabel, { color: '#fff' }]}>
              إلغاء
            </ThemedText>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: {
    padding: 16,
    gap: 16,
  },
  summaryCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 6,
  },
  summaryBytes: {
    fontSize: 28,
    fontWeight: '700',
  },
  summaryMeta: {
    fontSize: 13,
    opacity: 0.7,
  },
  summaryBar: {
    height: 6,
    width: '100%',
    backgroundColor: '#ffffff14',
    borderRadius: 3,
    overflow: 'hidden',
    marginTop: 6,
  },
  summaryBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 16,
  },
  sectionHeaderMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionCount: {
    fontSize: 13,
    opacity: 0.7,
  },
  card: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 8,
    gap: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  riwayaHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  riwayaName: {
    fontSize: 16,
  },
  activeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  activeBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  cardMeta: {
    fontSize: 12,
    opacity: 0.7,
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  actionLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
});
