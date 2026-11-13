import React from 'react';
import { Pressable, View } from 'react-native';

import { Feather } from '@expo/vector-icons';

import { ThemedText } from '@/components/ThemedText';
import { getRiwayaLabel } from '@/constants/riwayas';
import { getTafseerLabel, TafseerKey } from '@/constants/TafseerCdn';
import { Riwaya } from '@/types';
import { formatBytes } from '@/utils/downloads';

import { styles } from './styles';
export interface RiwayaRow {
  riwaya: Riwaya;
  pagesDownloaded: number;
  pagesTotal: number;
  bytes: number;
  estimatedBytes: number;
}
export interface TafseerRow {
  key: TafseerKey;
  cached: boolean;
  bytes: number;
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

export function RiwayaCard({
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
          {getRiwayaLabel(row.riwaya)}
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

export function TafseerCard({
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
          {getTafseerLabel(row.key)}
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
