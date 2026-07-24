/**
 * Hook for downloading + persisting a qurani.ai narration bundle for a
 * single riwaya.
 *
 *   const { startRiwaya, isBusy, progress } = useRiwayaDownload();
 *   await startRiwaya('hafs');
 *
 * Each download writes the full ~2 MB Quran text bundle to
 * `Paths.document/open-mushaf/api/<riwaya>/bundle.json` (native) or
 * `caches.open('open-mushaf-api-<riwaya>')` (web). The hook reports
 * progress through `downloadProgressAtom` (the same one
 * `useTafseerDownload` uses) so the Downloads page renders one
 * unified progress overlay.
 *
 * Cancel is wired through `AbortController.abort()` so the Cancel
 * chip on the Downloads UI actually stops the in-flight fetch.
 */

import { useCallback, useMemo, useRef } from 'react';

import { useAtom } from 'jotai';

import { RIWAYA_TO_QURANI_EDITION } from '@/constants/quraniEditions';
import type { Riwaya } from '@/types';
import { getCompleteQuran, QuranApiError } from '@/utils/api/qurani';
import { deleteRiwaya, persistRiwayaBundle } from '@/utils/api/qurani/cache';
import { DownloadProgress, resourceKeyOf } from '@/utils/downloads/types';

import { downloadProgressAtom } from './useDownloadProgress';

/** Per-riwaya download progress entry. */
export type RiwayaDownloadProgress = DownloadProgress & {
  riwaya: Riwaya;
};

// Bounded concurrency for parallel-riwaya downloads. The qurani.ai
// `/quran` endpoint returns the entire Quran in one response, so
// today a single in-flight fetch is sufficient — this option is
// reserved for a future "download all" affordance.
const DEFAULT_CONCURRENCY = 2;

const RETRY_DELAY_MS = [400, 1500] as const;
const MAX_ATTEMPTS = RETRY_DELAY_MS.length + 1;

const sleep = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

async function fetchAndPersistWithRetry(
  riwaya: Riwaya,
  signal: AbortSignal,
): Promise<{ bytes: number }> {
  const edition = RIWAYA_TO_QURANI_EDITION[riwaya];
  let lastErr: unknown = null;
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    if (signal.aborted) {
      throw new DOMException('Aborted', 'AbortError');
    }
    try {
      const surahs = await getCompleteQuran(edition, signal);
      const flat = surahs.flatMap((s) =>
        s.ayahs.map((a) => ({
          gid: a.number,
          surah: s.number,
          numberInSurah: a.numberInSurah,
          page: a.page,
          juz: a.juz,
          hizbQuarter: a.hizbQuarter,
          manzil: a.manzil,
          ruku: a.ruku,
          text: a.text,
          sajda: a.sajda,
        })),
      );
      const bytes = await persistRiwayaBundle(riwaya, JSON.stringify(flat));
      if (bytes === 0) {
        throw new Error('Disk write failed');
      }
      return { bytes };
    } catch (err) {
      lastErr = err;
      // QuranApiError 4xx is terminal — don't retry.
      if (err instanceof QuranApiError && err.kind === 'http-4xx') {
        throw err;
      }
      if (signal.aborted) throw err;
      if (attempt < RETRY_DELAY_MS.length) {
        await sleep(RETRY_DELAY_MS[attempt] ?? 0);
      }
    }
  }
  throw lastErr instanceof Error
    ? lastErr
    : new Error('Download failed after retries');
}

export function useRiwayaDownload(options?: { concurrency?: number }) {
  // Reserved for future parallel-riwaya downloads. The qurani.ai
  // `/quran` endpoint returns the entire Quran in one ~2 MB response,
  // so today a single in-flight fetch is sufficient and the option
  // is intentionally ignored.
  void (options?.concurrency ?? DEFAULT_CONCURRENCY);
  const [progressMap, setProgressMap] = useAtom(downloadProgressAtom);
  const abortRef = useRef<AbortController | null>(null);

  const isBusy = useMemo(
    () =>
      Object.values(progressMap).some(
        (p) =>
          p &&
          'status' in p &&
          (p.status === 'downloading' || p.status === 'queued'),
      ),
    [progressMap],
  );

  const cancel = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  /**
   * Download a single riwaya and persist it. Resolves on success,
   * throws on cancel or hard failure (caller should show a toast).
   */
  const startRiwaya = useCallback(
    async (riwaya: Riwaya): Promise<void> => {
      if (abortRef.current) {
        throw new Error('تنزيل آخر قيد التقدم بالفعل.');
      }
      const id = resourceKeyOf({ kind: 'riwaya', riwaya });
      const abort = new AbortController();
      abortRef.current = abort;

      // Drop any stale partial download before re-running so we don't
      // leave half-written bundles on disk if the user re-attempts.
      await deleteRiwaya(riwaya);

      setProgressMap((prev) => ({
        ...prev,
        [id]: {
          downloaded: 0,
          total: 1,
          status: 'downloading',
        },
      }));

      try {
        if (abort.signal.aborted) {
          setProgressMap((prev) => ({
            ...prev,
            [id]: { downloaded: 0, total: 1, status: 'cancelled' },
          }));
          return;
        }
        const result = await fetchAndPersistWithRetry(riwaya, abort.signal);
        if (abort.signal.aborted) {
          setProgressMap((prev) => ({
            ...prev,
            [id]: { downloaded: 0, total: 1, status: 'cancelled' },
          }));
          return;
        }
        setProgressMap((prev) => ({
          ...prev,
          [id]: {
            downloaded: 1,
            total: 1,
            status: 'done',
            bytes: result.bytes,
          },
        }));
      } catch (err) {
        if (abort.signal.aborted) {
          setProgressMap((prev) => ({
            ...prev,
            [id]: { downloaded: 0, total: 1, status: 'cancelled' },
          }));
          return;
        }
        setProgressMap((prev) => ({
          ...prev,
          [id]: {
            downloaded: 0,
            total: 1,
            status: 'error',
            error: err instanceof Error ? err.message : String(err),
          },
        }));
        throw err;
      } finally {
        abortRef.current = null;
      }
    },
    [setProgressMap],
  );

  return {
    startRiwaya,
    cancel,
    isBusy,
    progress: progressMap,
  };
}

/** Lightweight read-only accessor — components that just want to render progress. */
export function useRiwayaDownloadProgress() {
  const [progressMap] = useAtom(downloadProgressAtom);
  return progressMap;
}
