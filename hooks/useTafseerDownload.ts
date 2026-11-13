/**
 * Hook for managing a single tafseer offline download at a time. Mirrors
 * `useMushafDownload` but operates on one `TafseerKey` (each tafseer
 * JSON is one file (up to about 36 MB) instead of 604 small files, so there's no
 * loop — just one fetch + persist).
 *
 *   const { startTafseer, cancel, isBusy, progress } = useTafseerDownload();
 *   await startTafseer('muyassar');
 *
 * The hook writes through the `downloadProgressAtom` shared with
 * `useMushafDownload`, so a single progress overlay on the settings
 * page can show both kinds of in-flight work.
 *
 * Phase 3 implementation. Cancel is honored via `AbortSignal` so the
 * Cancel chip on the downloads UI actually kills the in-flight fetch
 * (not just stops new work).
 */

import { useCallback, useMemo } from 'react';

import { useAtom, useSetAtom } from 'jotai';

import { TafseerKey } from '@/constants/TafseerCdn';
import { downloadedTafseers } from '@/jotai/atoms';
import {
  deleteTafseer,
  downloadTafseer,
  isTafseerCached,
} from '@/utils/downloads';
import {
  acquireDownload,
  cancelDownload,
  isDownloadCancelled,
  releaseDownload,
  throwIfAborted,
} from '@/utils/downloads/coordinator';
import { DownloadProgress, resourceKeyOf } from '@/utils/downloads/types';

// The download progress atom is owned by useMushafDownload; consumers
// can import `downloadProgressAtom` / `useDownloadProgress` from
// `@/hooks` (they're re-exported via the hooks barrel).
import { downloadProgressAtom } from './useMushafDownload';

// -- the hook --------------------------------------------------------
export function useTafseerDownload() {
  const [progressMap, setProgressMap] = useAtom(downloadProgressAtom);
  const setDownloaded = useSetAtom(downloadedTafseers);

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

  const startTafseer = useCallback(
    async (key: TafseerKey): Promise<void> => {
      const id = resourceKeyOf({ kind: 'tafseer', key });
      const abort = acquireDownload();
      setProgressMap((prev) => ({
        ...prev,
        [id]: { downloaded: 0, total: 1, status: 'queued' },
      }));
      let wasCached = false;
      try {
        // Skip if already on disk.
        const cached = await isTafseerCached(key);
        wasCached = cached;
        throwIfAborted(abort.signal);
        if (cached) {
          setDownloaded((prev) => (prev.includes(key) ? prev : [...prev, key]));
          setProgressMap((prev) => ({
            ...prev,
            [id]: { downloaded: 1, total: 1, status: 'done' },
          }));
          return;
        }

        setProgressMap((prev) => ({
          ...prev,
          [id]: { downloaded: 0, total: 1, status: 'downloading' },
        }));

        throwIfAborted(abort.signal);
        const result = await downloadTafseer(key, abort.signal);
        if (result.bytes <= 0) throw new Error('Tafseer persistence failed');
        throwIfAborted(abort.signal);
        setDownloaded((prev) => (prev.includes(key) ? prev : [...prev, key]));
        const final: DownloadProgress = {
          downloaded: 1,
          total: 1,
          status: 'done',
        };
        setProgressMap((prev) => ({ ...prev, [id]: final }));
      } catch (err) {
        setDownloaded((prev) => prev.filter((value) => value !== key));
        if (isDownloadCancelled(abort.signal)) {
          if (!wasCached) {
            try {
              await deleteTafseer(key);
            } catch (cleanupError) {
              setProgressMap((prev) => ({
                ...prev,
                [id]: {
                  downloaded: 0,
                  total: 1,
                  status: 'error',
                  error: 'Could not remove cancelled download',
                },
              }));
              throw cleanupError;
            }
          }
          setProgressMap((prev) => ({
            ...prev,
            [id]: { downloaded: 0, total: 1, status: 'cancelled' },
          }));
          throwIfAborted(abort.signal);
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
        releaseDownload(abort);
      }
    },
    [setProgressMap, setDownloaded],
  );

  return {
    startTafseer,
    cancel,
    isBusy,
    progress: progressMap,
    deleteTafseer: useCallback((key: TafseerKey) => deleteTafseer(key), []),
  };
}
