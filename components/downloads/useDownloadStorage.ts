import { useCallback, useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';

import { useFocusEffect } from 'expo-router';
import { useAtom, useStore } from 'jotai/react';

import { RiwayaRow, TafseerRow } from '@/components/downloads/DownloadCards';
import { RIWAYAT_LIST } from '@/constants';
import { TAFSEERS_LIST } from '@/constants/TafseerCdn';
import { useDownloadProgress } from '@/hooks';
import { downloadProgressAtom } from '@/hooks/useMushafDownload';
import { downloadedRiwayat, downloadedTafseers } from '@/jotai/atoms';
import {
  getMushafRiwayaDirSizeBytes,
  getMushafRiwayaDownloadedPages,
  getStorageSnapshot,
  getTafseerFileSizeBytes,
  isTafseerCached,
  riwayaEstimatedBytes,
  riwayaTotalPages,
} from '@/utils/downloads';
import { isDownloadActive } from '@/utils/downloads/coordinator';
import { resourceKeyOf } from '@/utils/downloads/types';

const RIWAYAS = RIWAYAT_LIST;
const TAFSEER_KEYS = TAFSEERS_LIST;
export function useDownloadStorage() {
  const store = useStore();
  const [downloaded, setDownloaded] = useAtom(downloadedRiwayat);
  const [downloadedTafseersList, setDownloadedTafseers] =
    useAtom(downloadedTafseers);
  const progressMap = useDownloadProgress();
  const [rows, setRows] = useState<RiwayaRow[]>([]);
  const [tafseerRows, setTafseerRows] = useState<TafseerRow[]>([]);
  const [totalBytes, setTotalBytes] = useState(0);
  const [quotaBytes, setQuotaBytes] = useState<number | null>(null);
  const refreshGeneration = useRef(0);
  const refreshSizes = useCallback(async () => {
    const generation = ++refreshGeneration.current;
    const nextRiwayas: RiwayaRow[] = await Promise.all(
      RIWAYAS.map(async (riwaya) => ({
        riwaya,
        pagesDownloaded: await getMushafRiwayaDownloadedPages(riwaya),
        pagesTotal: riwayaTotalPages(riwaya),
        bytes: await getMushafRiwayaDirSizeBytes(riwaya),
        estimatedBytes: riwayaEstimatedBytes(riwaya),
      })),
    );
    const nextTafseers: TafseerRow[] = await Promise.all(
      TAFSEER_KEYS.map(async (key) => ({
        key,
        cached: await isTafseerCached(key),
        bytes: await getTafseerFileSizeBytes(key),
      })),
    );
    const snap = await getStorageSnapshot();
    if (generation !== refreshGeneration.current) return;
    const currentProgress = store.get(downloadProgressAtom);
    const canPublish = (id: keyof typeof currentProgress) => {
      const status = Object.entries(currentProgress).find(
        ([key]) => key === id,
      )?.[1].status;
      return status === undefined || status === 'done';
    };
    const verifiedTafseers = nextTafseers.map((row) => ({
      ...row,
      cached:
        row.cached &&
        canPublish(resourceKeyOf({ kind: 'tafseer', key: row.key })),
    }));
    setRows(nextRiwayas);
    setTafseerRows(verifiedTafseers);
    setTotalBytes(snap.totalBytes);
    if (!isDownloadActive()) {
      setDownloaded(
        nextRiwayas
          .filter(
            (row) =>
              row.pagesDownloaded === row.pagesTotal &&
              canPublish(resourceKeyOf({ kind: 'mushaf', riwaya: row.riwaya })),
          )
          .map((row) => row.riwaya),
      );
      setDownloadedTafseers(
        verifiedTafseers.filter((row) => row.cached).map((row) => row.key),
      );
    }
    const quota = await readStorageQuota();
    if (generation === refreshGeneration.current && quota !== undefined)
      setQuotaBytes(quota);
  }, [setDownloaded, setDownloadedTafseers, store]);

  const quotaFraction =
    quotaBytes && quotaBytes > 0 ? Math.min(1, totalBytes / quotaBytes) : 0;

  // Refresh on focus so deltas (delete / finish) reflect immediately.
  useFocusEffect(
    useCallback(() => {
      void refreshSizes().catch(() => {});
      return () => {
        refreshGeneration.current++;
      };
    }, [refreshSizes]),
  );

  // Depend on lifecycle transitions, not every page progress update.
  const lifecycle = Object.entries(progressMap)
    .map(([key, value]) => key + ':' + value.status)
    .join('|');
  useEffect(() => {
    if (!isDownloadActive()) void refreshSizes().catch(() => {});
  }, [lifecycle, refreshSizes]);

  return {
    downloaded,
    downloadedTafseersList,
    progressMap,
    rows,
    tafseerRows,
    totalBytes,
    quotaBytes,
    quotaFraction,
    refreshSizes,
  };
}

async function readStorageQuota(): Promise<number | null | undefined> {
  if (Platform.OS !== 'web' || typeof navigator === 'undefined')
    return undefined;
  const storage = (
    navigator as unknown as {
      storage?: { estimate?: () => Promise<StorageEstimate> };
    }
  ).storage;
  if (typeof storage?.estimate !== 'function') return undefined;
  try {
    const estimate = await storage.estimate();
    return typeof estimate.quota === 'number' ? estimate.quota : null;
  } catch {
    return undefined;
  }
}
