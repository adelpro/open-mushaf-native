/**
 * Lazy per-page loader for qurani.ai verses. Reads from the on-disk
 * snapshot first (`Paths.document/open-mushaf/api/<riwaya>/page-NNN.json`),
 * falls back to a network fetch on miss, persists the result for the
 * next cold start.
 *
 * The hook memoizes the per-page bundle in component state so the
 * same page doesn't re-fetch across renders. Callers that need a
 * forward window (e.g. next/prev page) should pair this with
 * `usePagePreloader`.
 */

import { useCallback, useEffect, useRef, useState } from 'react';

import { RIWAYA_TO_QURANI_EDITION } from '@/constants/quraniEditions';
import type { Riwaya } from '@/types';
import type { QuranApiPageBundle } from '@/types/quran-api';
import { getPage } from '@/utils/api/qurani';
import {
  isPageSnapshotCached,
  persistPageSnapshot,
  readPageSnapshotFromDisk,
} from '@/utils/api/qurani/cache';

export type UsePageBundleState = {
  bundle: QuranApiPageBundle | null;
  isLoading: boolean;
  error: string | null;
};

export function usePageBundle(args: {
  riwaya: Riwaya | null;
  page: number;
}): UsePageBundleState & { reload: () => void } {
  const { riwaya, page } = args;
  const [bundle, setBundle] = useState<QuranApiPageBundle | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Per-(riwaya, page) cache so a quick flip back to a page we
  // already loaded doesn't show a loading spinner again.
  const memoRef = useRef<Map<string, QuranApiPageBundle>>(new Map());

  const key = riwaya ? `${riwaya}:${page}` : '';

  const load = useCallback(async () => {
    if (!riwaya || page < 1) {
      setBundle(null);
      return;
    }
    const cached = memoRef.current.get(key);
    if (cached) {
      setBundle(cached);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      // 1) Disk
      let live: QuranApiPageBundle | null = null;
      if (await isPageSnapshotCached(riwaya, page)) {
        const raw = await readPageSnapshotFromDisk(riwaya, page);
        if (raw) live = JSON.parse(raw) as QuranApiPageBundle;
      }
      // 2) Network
      if (!live) {
        const api = await getPage(page, RIWAYA_TO_QURANI_EDITION[riwaya]);
        live = {
          page: api.number,
          topPageSurah: api.topPageSurah.number,
          topPageJuz: api.topPageJuz,
          hizbNumbers: api.hizbNumbers,
          ayahs: api.ayahs.map((a) => ({
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
        void persistPageSnapshot(riwaya, page, JSON.stringify(live));
      }
      memoRef.current.set(key, live);
      setBundle(live);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setIsLoading(false);
    }
  }, [riwaya, page, key]);

  useEffect(() => {
    void load();
  }, [load]);

  return { bundle, isLoading, error, reload: load };
}
