/**
 * Read-only aggregator over the persisted `downloadedRiwayat` and
 * `downloadedTafseers` MMKV atoms. Lets a consumer (riwaya selector,
 * tafseer popup, downloads page, seg­mented-control annotation)
 * answer "is this thing available offline?" + "how many of N total?"
 * without subscribing to both atoms in two places.
 *
 * No new state — derives everything from the existing MMKV-backed
 * Jotai atoms so updates flow the same path as before.
 */

import { useMemo } from 'react';

import { useAtomValue } from 'jotai';

import { TafseerKey } from '@/constants/TafseerCdn';
import { downloadedRiwaya, downloadedTafseers } from '@/jotai/atoms';
import { Riwaya } from '@/types';

export interface DownloadStatus {
  riwayaIsDownloaded: (riwaya: Riwaya) => boolean;
  tafseerIsDownloaded: (key: TafseerKey) => boolean;
  riwayaCount: number;
  tafseerCount: number;
  downloadedRiwayaList: Riwaya[];
  downloadedTafseerList: TafseerKey[];
}

export function useDownloadStatus(): DownloadStatus {
  const riwayaSet = useAtomValue(downloadedRiwaya);
  const tafseerSet = useAtomValue(downloadedTafseers);

  return useMemo<DownloadStatus>(() => {
    const riwayaSetNorm = new Set<Riwaya>(riwayaSet);
    const tafseerSetNorm = new Set<TafseerKey>(tafseerSet);
    return {
      riwayaIsDownloaded: (r: Riwaya) => riwayaSetNorm.has(r),
      tafseerIsDownloaded: (k: TafseerKey) => tafseerSetNorm.has(k),
      riwayaCount: riwayaSet.length,
      tafseerCount: tafseerSet.length,
      downloadedRiwayaList: riwayaSet,
      downloadedTafseerList: tafseerSet,
    };
  }, [riwayaSet, tafseerSet]);
}
