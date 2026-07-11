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
import { useAtom } from 'jotai/react';

import { ThemedText, ThemedView } from '@/components';
import { RIWAYA_ARABIC_LABEL } from '@/constants';
import { TAFSEER_ARABIC_LABEL, TafseerKey } from '@/constants/TafseerCdn';
import { useNotification } from '@/Context/NotificationProvider';
import {
  useColors,
  useDownloadProgress,
  useMushafDownload,
  useTafseerDownload,
} from '@/hooks';
import { downloadedRiwayat, downloadedTafseers } from '@/jotai/atoms';
import { Riwaya } from '@/types';
import {
  deleteMushafRiwaya,
  deleteTafseer,
  formatBytes,
  getMushafRiwayaDirSizeBytes,
  getMushafRiwayaDownloadedPages,
  getStorageSnapshot,
  getTafseerFileSizeBytes,
  isTafseerCached,
  riwayaEstimatedBytes,
  riwayaTotalPages,
} from '@/utils/downloads';
import { resourceKeyOf } from '@/utils/downloads/types';

const RIWAYAS: Riwaya[] = [
  'hafs',
  'warsh',
  'qalon-kfqc',
  'qalon-libya-awqaf',
  'douri-kfqc',
  'shubah-kfqc',
];

const TAFSEER_KEYS: TafseerKey[] = [
  'baghawy',
  'earab',
  'katheer',
  'maany',
  'muyassar',
  'nozool-wahidy',
  'qortoby',
  'saady',
  'tabary',
  'tanweer',
];

interface RiwayaRow {
  riwaya: Riwaya;
  pagesDownloaded: number;
  pagesTotal: number;
  bytes: number;
  /** Upper-bound estimate (pages × ~12 KB) shown when nothing is on disk yet. */
  estimatedBytes: number;
}

interface TafseerRow {
  key: TafseerKey;
  cached: boolean;
  bytes: number;
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

  const [downloaded, setDownloaded] = useAtom(downloadedRiwayat);
  const [downloadedTafseersList, setDownloadedTafseers] =
    useAtom(downloadedTafseers);
  const progressMap = useDownloadProgress();

  const { startRiwaya, cancel: cancelRiwaya } = useMushafDownload();
  const { startTafseer, cancel: cancelTafseer } = useTafseerDownload();

  const [rows, setRows] = useState<RiwayaRow[]>([]);
  const [tafseerRows, setTafseerRows] = useState<TafseerRow[]>([]);
  const [totalBytes, setTotalBytes] = useState(0);
  const [quotaBytes, setQuotaBytes] = useState<number | null>(null);
  const [busyRiwaya, setBusyRiwaya] = useState<Riwaya | null>(null);
  const [busyTafseer, setBusyTafseer] = useState<TafseerKey | null>(null);
  // Per-section collapse state. Defaults to expanded so users see
  // everything on first visit. Local state only — collapse preference
  // is ephemeral (not persisted to MMKV).
  const [riwayaSectionExpanded, setRiwayaSectionExpanded] = useState(true);
  const [tafseerSectionExpanded, setTafseerSectionExpanded] = useState(true);

  const refreshSizes = useCallback(async () => {
    const nextRiwayas: RiwayaRow[] = await Promise.all(
      RIWAYAS.map(async (riwaya) => ({
        riwaya,
        pagesDownloaded: await getMushafRiwayaDownloadedPages(riwaya),
        pagesTotal: riwayaTotalPages(riwaya),
        bytes: await getMushafRiwayaDirSizeBytes(riwaya),
        estimatedBytes: riwayaEstimatedBytes(riwaya),
      })),
    );
    setRows(nextRiwayas);
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
    // Web-only: ask the browser for its storage quota so the UI can
    // show "X of Y used" instead of just "X used". Feature-detected;
    // Safari still lags behind on `navigator.storage` so the JSON
    // could be `undefined` — in that case we just keep the prior
    // value (or `null` on first render).
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
          // ignore — quota remains whatever it was
        }
      }
    }
  }, []);

  const quotaFraction =
    quotaBytes && quotaBytes > 0 ? Math.min(1, totalBytes / quotaBytes) : 0;

  // Refresh on focus so deltas (delete / finish) reflect immediately.
  useFocusEffect(
    useCallback(() => {
      refreshSizes();
    }, [refreshSizes]),
  );

  // And refresh whenever any progress transitions to "done" — the size
  // snapshot needs to update as the last few bytes land on disk.
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

  const handleDownload = useCallback(
    async (riwaya: Riwaya) => {
      setBusyRiwaya(riwaya);
      try {
        await startRiwaya(riwaya);
        setDownloaded((prev) =>
          prev.includes(riwaya) ? prev : [...prev, riwaya],
        );
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
    [startRiwaya, setDownloaded, notify, refreshSizes],
  );

  const handleCancel = useCallback(() => {
    cancelRiwaya();
    setBusyRiwaya(null);
    refreshSizes();
  }, [cancelRiwaya, refreshSizes]);

  const handleDelete = useCallback(
    async (riwaya: Riwaya) => {
      try {
        await deleteMushafRiwaya(riwaya);
        setDownloaded((prev) => prev.filter((r) => r !== riwaya));
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
    [setDownloaded, notify, refreshSizes],
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
            {downloadedTafseersList.length} تفسير · {downloaded.length} رواية
          </ThemedText>
        </ThemedView>

        <CollapsibleSection
          title="الروايات"
          totalCount={RIWAYAS.length}
          downloadedCount={downloaded.length}
          expanded={riwayaSectionExpanded}
          onToggle={() => setRiwayaSectionExpanded((v) => !v)}
        >
          {sortByStatus(
            rows.map((row) => {
              const riwayaId = resourceKeyOf({
                kind: 'mushaf',
                riwaya: row.riwaya,
              });
              const progress = progressMap[riwayaId];
              const isInProgress =
                busyRiwaya === row.riwaya && progress?.status === 'downloading';
              const isDone = downloaded.includes(row.riwaya);
              const status: RowStatus = isInProgress
                ? 'downloading'
                : isDone
                  ? 'done'
                  : 'pending';
              return { id: row.riwaya, row, status, isDone, isInProgress };
            }),
          ).map(({ id, row, status, isDone, isInProgress }) => {
            const riwayaId = resourceKeyOf({ kind: 'mushaf', riwaya: id });
            const progress = progressMap[riwayaId];
            return (
              <RiwayaCard
                key={row.riwaya}
                row={row}
                isDone={isDone ?? false}
                isDownloading={isInProgress ?? false}
                progress={progress}
                primaryColor={primaryColor}
                dangerColor={dangerColor}
                textColor={textColor}
                iconColor={iconColor}
                onDownload={() => handleDownload(row.riwaya)}
                onCancel={handleCancel}
                onDelete={() =>
                  Alert.alert(
                    `حذف ${RIWAYA_ARABIC_LABEL[row.riwaya]}`,
                    `سيتم حذف ${row.pagesDownloaded} صفحة من ذاكرة الجهاز. هل تريد المتابعة؟`,
                    [
                      { text: 'إلغاء', style: 'cancel' },
                      {
                        text: 'حذف',
                        style: 'destructive',
                        onPress: () => handleDelete(row.riwaya),
                      },
                    ],
                  )
                }
              />
            );
          })}

          <ThemedText style={styles.footnote}>
            تنزيل الرواية يجعل صفحاتها متاحة للقراءة دون اتصال بالإنترنت.
          </ThemedText>
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
              const tafseerId = resourceKeyOf({
                kind: 'tafseer',
                key: row.key,
              });
              const progress = progressMap[tafseerId];
              const isInProgress =
                busyTafseer === row.key && progress?.status === 'downloading';
              const isDone = row.cached;
              const status: RowStatus = isInProgress
                ? 'downloading'
                : isDone
                  ? 'done'
                  : 'pending';
              return { id: row.key, row, status };
            }),
          ).map(({ row, status }) => {
            const tafseerId = resourceKeyOf({ kind: 'tafseer', key: row.key });
            const progress = progressMap[tafseerId];
            const isInProgress =
              busyTafseer === row.key && progress?.status === 'downloading';
            return (
              <TafseerCard
                key={row.key}
                row={row}
                isDownloading={isInProgress}
                progress={progress}
                primaryColor={primaryColor}
                dangerColor={dangerColor}
                textColor={textColor}
                onDownload={() => handleTafseerDownload(row.key)}
                onCancel={handleTafseerCancel}
                onDelete={() =>
                  Alert.alert(
                    `حذف ${TAFSEER_ARABIC_LABEL[row.key]}`,
                    `سيتم حذف ملف التفسير من ذاكرة الجهاز. هل تريد المتابعة؟`,
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
              />
            );
          })}

          <ThemedText style={styles.footnote}>
            تنزيل التفسير يجعله متاحًا دون اتصال عند الضغط المطوّل على أي آية.
          </ThemedText>
        </CollapsibleSection>
      </ScrollView>
    </>
  );
}

interface RiwayaCardProps {
  row: RiwayaRow;
  isDone: boolean;
  isDownloading: boolean;
  progress:
    | {
        downloaded: number;
        total: number;
        status: string;
      }
    | undefined;
  primaryColor: string;
  dangerColor: string;
  textColor: string;
  iconColor: string;
  onDownload: () => void;
  onCancel: () => void;
  onDelete: () => void;
}

function RiwayaCard({
  row,
  isDone,
  isDownloading,
  progress,
  primaryColor,
  dangerColor,
  textColor,
  onDownload,
  onCancel,
  onDelete,
}: RiwayaCardProps) {
  const ratio =
    progress && progress.total > 0
      ? Math.min(1, progress.downloaded / progress.total)
      : isDone
        ? 1
        : 0;
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: 'rgba(255,255,255,0.04)',
          borderColor: textColor + '22',
        },
      ]}
    >
      <View style={styles.cardHeader}>
        <ThemedText type="defaultSemiBold" style={styles.riwayaName}>
          {RIWAYA_ARABIC_LABEL[row.riwaya]}
        </ThemedText>
        {isDone ? (
          <ThemedText style={[styles.statusBadge, { color: primaryColor }]}>
            ✓ جاهز
          </ThemedText>
        ) : isDownloading ? (
          <ThemedText style={[styles.statusBadge, { color: primaryColor }]}>
            جارٍ التنزيل… {progress?.downloaded ?? 0}/
            {progress?.total ?? row.pagesTotal}
          </ThemedText>
        ) : row.pagesDownloaded > 0 ? (
          <ThemedText style={[styles.statusBadge, { color: textColor + '99' }]}>
            {row.pagesDownloaded}/{row.pagesTotal}
          </ThemedText>
        ) : (
          <ThemedText style={[styles.statusBadge, { color: textColor + '66' }]}>
            غير منزل
          </ThemedText>
        )}
      </View>

      <ThemedText
        style={[styles.cardMeta, row.bytes === 0 && { opacity: 0.7 }]}
      >
        {row.pagesTotal} صفحة ·{' '}
        {row.bytes === 0
          ? `≈ ${formatBytes(row.estimatedBytes)}`
          : formatBytes(row.bytes)}
      </ThemedText>

      <View style={styles.progressBarTrack}>
        <View
          style={[
            styles.progressBarFill,
            {
              width: `${ratio * 100}%`,
              backgroundColor: isDone ? primaryColor : primaryColor + 'AA',
            },
          ]}
        />
      </View>

      <View style={styles.cardActions}>
        {isDownloading ? (
          <ActionChip
            iconName="x-circle"
            iconColor={dangerColor}
            label="إلغاء"
            onPress={onCancel}
          />
        ) : isDone ? (
          <ActionChip
            iconName="trash-2"
            iconColor={dangerColor}
            label="حذف"
            onPress={onDelete}
          />
        ) : (
          <ActionChip
            iconName="download"
            iconColor={primaryColor}
            label="تنزيل"
            onPress={onDownload}
            disabled={progress?.status === 'downloading'}
          />
        )}
      </View>
    </View>
  );
}

function ActionChip({
  iconName,
  iconColor,
  label,
  onPress,
  disabled,
}: {
  iconName: React.ComponentProps<typeof Feather>['name'];
  iconColor: string;
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[styles.chip, disabled && { opacity: 0.4 }]}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <Feather name={iconName} size={18} color={iconColor} />
      <ThemedText style={[styles.chipLabel, { color: iconColor }]}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

interface TafseerCardProps {
  row: TafseerRow;
  isDownloading: boolean;
  progress:
    | {
        downloaded: number;
        total: number;
        status: string;
      }
    | undefined;
  primaryColor: string;
  dangerColor: string;
  textColor: string;
  onDownload: () => void;
  onCancel: () => void;
  onDelete: () => void;
}

function TafseerCard({
  row,
  isDownloading,
  progress,
  primaryColor,
  dangerColor,
  textColor,
  onDownload,
  onCancel,
  onDelete,
}: TafseerCardProps) {
  const ratio = isDownloading
    ? Math.max(0, Math.min(1, (progress?.downloaded ?? 0) / 1))
    : row.cached
      ? 1
      : 0;
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: 'rgba(255,255,255,0.04)',
          borderColor: textColor + '22',
        },
      ]}
    >
      <View style={styles.cardHeader}>
        <ThemedText type="defaultSemiBold" style={styles.riwayaName}>
          {TAFSEER_ARABIC_LABEL[row.key]}
        </ThemedText>
        {row.cached ? (
          <ThemedText style={[styles.statusBadge, { color: primaryColor }]}>
            ✓ جاهز
          </ThemedText>
        ) : isDownloading ? (
          <ThemedText style={[styles.statusBadge, { color: primaryColor }]}>
            جارٍ التنزيل…
          </ThemedText>
        ) : (
          <ThemedText style={[styles.statusBadge, { color: textColor + '66' }]}>
            غير منزل
          </ThemedText>
        )}
      </View>

      <ThemedText style={styles.cardMeta}>{formatBytes(row.bytes)}</ThemedText>

      <View style={styles.progressBarTrack}>
        <View
          style={[
            styles.progressBarFill,
            {
              width: `${ratio * 100}%`,
              backgroundColor: row.cached ? primaryColor : primaryColor + 'AA',
            },
          ]}
        />
      </View>

      <View style={styles.cardActions}>
        {isDownloading ? (
          <ActionChip
            iconName="x-circle"
            iconColor={dangerColor}
            label="إلغاء"
            onPress={onCancel}
          />
        ) : row.cached ? (
          <ActionChip
            iconName="trash-2"
            iconColor={dangerColor}
            label="حذف"
            onPress={onDelete}
          />
        ) : (
          <ActionChip
            iconName="download"
            iconColor={primaryColor}
            label="تنزيل"
            onPress={onDownload}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: {
    padding: 16,
    paddingBottom: 80,
  },
  summaryCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    alignItems: 'center',
  },
  summaryBytes: {
    fontSize: 28,
    marginTop: 8,
    fontFamily: 'Tajawal_700Bold',
  },
  summaryMeta: {
    fontSize: 13,
    opacity: 0.6,
    marginTop: 4,
  },
  summaryBar: {
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(127,127,127,0.18)',
    marginTop: 6,
    width: '60%',
    overflow: 'hidden',
  },
  summaryBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  sectionTitle: {
    marginBottom: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 10,
    paddingVertical: 4,
  },
  sectionHeaderMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionCount: {
    fontSize: 13,
    opacity: 0.6,
    fontFamily: 'Tajawal_500Medium',
  },
  card: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  riwayaName: {
    fontSize: 18,
  },
  statusBadge: {
    fontSize: 12,
    fontFamily: 'Tajawal_700Bold',
  },
  cardMeta: {
    fontSize: 12,
    opacity: 0.6,
    marginTop: 4,
  },
  progressBarTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(127,127,127,0.18)',
    marginTop: 10,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(127,127,127,0.25)',
  },
  chipLabel: {
    fontSize: 14,
    fontFamily: 'Tajawal_500Medium',
  },
  footnote: {
    fontSize: 12,
    opacity: 0.5,
    marginTop: 16,
    textAlign: 'center',
  },
  backButton: {
    marginTop: 24,
    alignSelf: 'center',
    width: 200,
  },
});
