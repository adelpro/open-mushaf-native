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

import { useCallback, useMemo } from 'react';

import { atom, useAtom, useAtomValue, useSetAtom, useStore } from 'jotai';

import { downloadedRiwayat } from '@/jotai/atoms';
import { Riwaya } from '@/types';
import {
  downloadMushafPage,
  downloadTafseer,
  isMushafPageCached,
  readMushafPageFromDisk,
  riwayaTotalPages,
} from '@/utils/downloads';
import {
  abortableDelay,
  acquireDownload,
  cancelDownload,
  isDownloadCancelled,
  releaseDownload,
  throwIfAborted,
} from '@/utils/downloads/coordinator';
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
async function boundedMap<T>(
  items: readonly T[],
  concurrency: number,
  fn: (item: T, index: number) => Promise<void>,
): Promise<void> {
  let cursor = 0;
  const worker = async () => {
    while (cursor < items.length) {
      const idx = cursor++;
      const item = items.at(idx);
      if (item !== undefined) await fn(item, idx);
    }
  };
  const workers = Array.from({ length: concurrency }, () => worker());
  await Promise.all(workers);
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
  let attempt = 0;
  for (;;) {
    throwIfAborted(signal);
    try {
      return await downloadMushafPage(riwaya, page, signal);
    } catch (error) {
      throwIfAborted(signal);
      const delay = RETRY_DELAY_MS.at(attempt++);
      // The worker catches exhausted retries and records a failed page.
      if (delay === undefined) throw error;
      onRetry?.(attempt);
      await abortableDelay(delay, signal);
    }
  }
}

// -- the hook --------------------------------------------------------
export function useMushafDownload(options?: { concurrency?: number }) {
  const store = useStore();
  const concurrency = options?.concurrency ?? DEFAULT_CONCURRENCY;
  const [progressMap, setProgressMap] = useAtom(downloadProgressAtom);
  const setDownloaded = useSetAtom(downloadedRiwayat);

  const isBusy = useMemo(
    () =>
      Object.values(progressMap).some(
        (p) => p.status === 'downloading' || p.status === 'queued',
      ),
    [progressMap],
  );

  const cancel = useCallback(() => {
    cancelDownload();
  }, []);

  const startRiwaya = useCallback(
    async (riwaya: Riwaya): Promise<void> => {
      validateConcurrency(concurrency);
      const total = riwayaTotalPages(riwaya);
      const id = resourceKeyOf({ kind: 'mushaf', riwaya });
      const abort = acquireDownload();
      const wasDownloaded = store.get(downloadedRiwayat).includes(riwaya);
      let cacheKnownIncomplete = false;
      let doneCount = 0;
      setProgressMap((prev) => ({
        ...prev,
        [id]: { downloaded: 0, total, status: 'queued' },
      }));
      try {
        // Pages we'll actually fetch. Skip pages already on disk so
        // re-running a download that crashed partway finishes quickly.
        const pending: number[] = [];
        for (let page = 1; page <= total; page++) {
          throwIfAborted(abort.signal);
          const cached = await isMushafPageCached(riwaya, page);
          if (!cached) {
            cacheKnownIncomplete = true;
            pending.push(page);
          }
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
        doneCount = total - pending.length;
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
        throwIfAborted(abort.signal);
        await boundedMap(pending, concurrency, async (page) => {
          if (isDownloadCancelled(abort.signal)) return;
          try {
            const result = await downloadWithRetry(riwaya, page, abort.signal);
            if (result.bytes <= 0) throw new Error('Page persistence failed');
            throwIfAborted(abort.signal);
            doneCount++;
            emitProgress();
          } catch {
            // AbortError → just bail; otherwise count the page as a
            // permanent failure but keep the loop running so other
            // pages still land.
            if (isDownloadCancelled(abort.signal)) return;
            errorCount++;
            // Final emit on errors so the UI sees the gap.
            emitProgress(true);
          }
        });
        throwIfAborted(abort.signal);
        if (errorCount > 0 || doneCount !== total)
          throw new Error('Some pages failed to download');
        setDownloaded((prev) =>
          prev.includes(riwaya) ? prev : [...prev, riwaya],
        );
        setProgressMap((prev) => ({
          ...prev,
          [id]: { downloaded: total, total, status: 'done' },
        }));
      } catch (error) {
        // An interrupted read-only scan cannot invalidate an existing pack.
        if (wasDownloaded && !cacheKnownIncomplete) {
          setProgressMap((prev) => ({
            ...prev,
            [id]: { downloaded: total, total, status: 'done' },
          }));
          throw error;
        }
        setDownloaded((prev) => prev.filter((value) => value !== riwaya));
        setProgressMap((prev) => ({
          ...prev,
          [id]: {
            downloaded: doneCount,
            total,
            status: abort.signal.aborted ? 'cancelled' : 'error',
          },
        }));
        throw error;
      } finally {
        releaseDownload(abort);
      }
    },
    [concurrency, setProgressMap, setDownloaded, store],
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

function validateConcurrency(concurrency: number) {
  if (!Number.isInteger(concurrency) || concurrency < 1 || concurrency > 32)
    throw new Error('Invalid download concurrency');
}
