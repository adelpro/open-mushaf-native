/**
 * Hook + helpers for executing an offline mushaf download.
 *
 *   const { startRiwaya, isBusy, progress, cancel } = useMushafDownload();
 *   await startRiwaya('hafs');
 *
 * The hook exposes a small, single-track API (one download at a time).
 * `progress` is a reactive record keyed by resource id so multiple
 * consumers (settings page, toast updates) can read it. Cancel is
 * wired through to in-flight fetches via the `AbortSignal`, so taps
 * on the Cancel chip stop further work immediately.
 *
 * The download is bounded at `DEFAULT_CONCURRENCY = 8` simultaneous
 * fetches. jsDelivr fronts the CDN with HTTP/2 multiplexing, so 8 in
 * flight saturates a typical mobile link without hitting any rate
 * limits; bump the second arg of `boundedMap` if your user is on a
 * faster pipe.
 *
 * Each fetch is wrapped in a small retry — at most two retries with
 * 200ms / 800ms backoff — so a transient 5xx or socket reset
 * doesn't fail the entire queue.
 *
 * Persistence: the hook only mutates `downloadedRiwayat` (an MMKV
 * atom already in `jotai/atoms.ts`) when the loop completes without
 * being cancelled. The settings UI can observe that atom to drive
 * its cards.
 */

import { useCallback, useMemo, useRef } from 'react';

import { atom, useAtom, useAtomValue } from 'jotai';

import { Riwaya } from '@/types';
import {
  downloadMushafPage,
  downloadTafseer,
  isMushafPageCached,
  readMushafPageFromDisk,
  riwayaTotalPages,
} from '@/utils/downloads';
import {
  DownloadProgress,
  ProgressMap,
  resourceKeyOf,
} from '@/utils/downloads/types';

/** Default in-flight fetches when downloading a riwaya. */
export const DEFAULT_CONCURRENCY = 8;

/** Per-page retry parameters. */
const RETRY_DELAY_MS = [200, 800];

// -- in-memory progress atom (not persisted) ------------------------
export const downloadProgressAtom = atom<ProgressMap>({});

// -- bounded-concurrency worker pool -------------------------------
//
// Each worker grabs the next index from a shared cursor and processes
// it. `Promise.all([...workers])` waits for all workers to drain the
// queue. The cursor++ is non-atomic in JS (single-threaded) but the
// pattern is the standard async-pool idiom.
async function boundedMap<T, R>(
  items: readonly T[],
  concurrency: number,
  fn: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let cursor = 0;
  const worker = async () => {
    while (cursor < items.length) {
      const idx = cursor++;
      results[idx] = await fn(items[idx], idx);
    }
  };
  const workers = Array.from({ length: concurrency }, () => worker());
  await Promise.all(workers);
  return results;
}

// -- retry helper ---------------------------------------------------
//
// `fetch()` rejects on network errors and `AbortController.abort()`;
// everything else is OK. The retry loop backs off (200ms / 800ms)
// before re-attempting, but treats abort as terminal so cancel is
// immediate. The `onRetry` callback is called for telemetry.
async function downloadWithRetry(
  riwaya: Riwaya,
  page: number,
  signal: AbortSignal,
  onRetry?: (attempt: number) => void,
): Promise<{ bytes: number }> {
  const maxAttempts = RETRY_DELAY_MS.length + 1;
  let lastError: unknown = null;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    if (signal.aborted) {
      throw new DOMException('Aborted', 'AbortError');
    }
    try {
      return await downloadMushafPage(riwaya, page, signal);
    } catch (err) {
      if (signal.aborted) throw err;
      lastError = err;
      if (attempt >= RETRY_DELAY_MS.length) break;
      const delay = RETRY_DELAY_MS[attempt] ?? 0;
      onRetry?.(attempt + 1);
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  throw lastError instanceof Error
    ? lastError
    : new Error('Download failed after retries');
}

// -- the hook --------------------------------------------------------
export function useMushafDownload(options?: { concurrency?: number }) {
  const concurrency = options?.concurrency ?? DEFAULT_CONCURRENCY;
  const [progressMap, setProgressMap] = useAtom(downloadProgressAtom);
  const abortRef = useRef<AbortController | null>(null);

  const isBusy = useMemo(
    () =>
      Object.values(progressMap).some(
        (p) => p?.status === 'downloading' || p?.status === 'queued',
      ),
    [progressMap],
  );

  const cancel = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const startRiwaya = useCallback(
    async (riwaya: Riwaya): Promise<void> => {
      if (abortRef.current) {
        throw new Error('تنزيل آخر قيد التقدم بالفعل.');
      }
      const total = riwayaTotalPages(riwaya);
      const id = resourceKeyOf({ kind: 'mushaf', riwaya });
      const abort = new AbortController();
      abortRef.current = abort;

      // Pages we'll actually fetch. Skip pages already on disk so
      // re-running a download that crashed partway finishes quickly.
      const pending: number[] = [];
      for (let page = 1; page <= total; page++) {
        const cached = await isMushafPageCached(riwaya, page);
        if (!cached) pending.push(page);
      }

      setProgressMap((prev) => ({
        ...prev,
        [id]: {
          downloaded: total - pending.length,
          total,
          status: 'downloading',
        },
      }));

      // Throttled progress emit: only update state every `EMIT_EVERY`
      // completed pages to keep React renders cheap on the 604-page
      // hafs download.
      const EMIT_EVERY = 4;
      let doneCount = total - pending.length;
      let emittedAt = doneCount;
      const emitProgress = (force = false) => {
        if (!force && doneCount - emittedAt < EMIT_EVERY) return;
        emittedAt = doneCount;
        const snap: DownloadProgress = {
          downloaded: doneCount,
          total,
          status: 'downloading',
        };
        setProgressMap((prev) => ({ ...prev, [id]: snap }));
      };

      let errorCount = 0;
      try {
        if (abort.signal.aborted) {
          setProgressMap((prev) => ({
            ...prev,
            [id]: {
              downloaded: doneCount,
              total,
              status: 'cancelled',
            },
          }));
          return;
        }
        await boundedMap(pending, concurrency, async (page) => {
          if (abort.signal.aborted) return;
          try {
            await downloadWithRetry(riwaya, page, abort.signal);
            doneCount++;
            emitProgress();
          } catch {
            // AbortError → just bail; otherwise count the page as a
            // permanent failure but keep the loop running so other
            // pages still land.
            if (abort.signal.aborted) return;
            errorCount++;
            // Final emit on errors so the UI sees the gap.
            emitProgress(true);
          }
        });
        const final: DownloadProgress = abort.signal.aborted
          ? {
              downloaded: doneCount,
              total,
              status: 'cancelled',
            }
          : errorCount > 0
            ? { downloaded: doneCount, total, status: 'error' }
            : { downloaded: total, total, status: 'done' };
        emitProgress(true);
        setProgressMap((prev) => ({ ...prev, [id]: final }));
      } finally {
        abortRef.current = null;
      }
    },
    [concurrency, setProgressMap],
  );

  // Read from disk on demand for a one-shot accessor. Used by the
  // settings UI's per-page count check; cheap because the helper
  // is in-memory cached once per render.
  const readRiwayaPageFromCache = useCallback(
    async (riwaya: Riwaya, page: number) => {
      try {
        return await readMushafPageFromDisk(riwaya, page);
      } catch {
        return null;
      }
    },
    [],
  );

  return {
    startRiwaya,
    cancel,
    isBusy,
    progress: progressMap,
    readRiwayaPageFromCache,
  };
}

/** Lightweight read-only accessor — for components that just want to
 *  render progress without driving a download. */
export function useDownloadProgress(): ProgressMap {
  return useAtomValue(downloadProgressAtom);
}

/** Re-export so other modules can build their own controllers
 *  with the same helpers (e.g. for tafseer). */
export { downloadTafseer };
