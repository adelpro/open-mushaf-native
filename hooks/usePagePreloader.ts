/**
 * Side-effect-only hook that primes `usePageBundle` for the
 * current page ±2 (so swiping right/left feels instant). Replaces
 * the deleted `useImagePreloader` from the SVG era.
 *
 * Reads from `useRiwayaCache` to know the active riwaya; warms
 * the per-page snapshots into the cache layer's disk by calling the
 * `getPage` endpoint for the surrounding pages. Doesn't return
 * anything — consumers should call `usePageBundle` directly for the
 * page they actually render.
 */

import { useEffect } from 'react';

import { RIWAYA_TO_QURANI_EDITION } from '@/constants/quraniEditions';
import { getPage } from '@/utils/api/qurani';
import {
  isPageSnapshotCached,
  persistPageSnapshot,
} from '@/utils/api/qurani/cache';

import { useRiwayaCache } from './useRiwayaCache';

const WINDOW_PAGES = 2;

export function usePagePreloader(currentPage: number): void {
  const { riwaya, isReady } = useRiwayaCache();

  useEffect(() => {
    if (!isReady || !riwaya || currentPage < 1) return;

    const edition = RIWAYA_TO_QURANI_EDITION[riwaya];
    let cancelled = false;
    const pages: number[] = [];
    for (let offset = -WINDOW_PAGES; offset <= WINDOW_PAGES; offset++) {
      const p = currentPage + offset;
      if (p >= 1) pages.push(p);
    }

    (async () => {
      for (const p of pages) {
        if (cancelled) return;
        try {
          if (await isPageSnapshotCached(riwaya, p)) continue;
          const live = await getPage(p, edition);
          const bundle = {
            page: live.number,
            topPageSurah: live.topPageSurah.number,
            topPageJuz: live.topPageJuz,
            hizbNumbers: live.hizbNumbers,
            ayahs: live.ayahs.map((a) => ({
              gid: a.number,
              surah: a.surah.number,
              numberInSurah: a.numberInSurah,
              page: a.page,
              juz: a.juz,
              hizbQuarter: a.hizbQuarter,
              manzil: a.manzil,
              ruku: a.ruku,
              text: a.text,
              sajda: a.sajda,
            })),
          };
          void persistPageSnapshot(riwaya, p, JSON.stringify(bundle));
        } catch {
          // Best-effort; next mount retries.
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [currentPage, riwaya, isReady]);
}
