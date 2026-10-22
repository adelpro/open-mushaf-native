/**
 * Hook for managing a single tafseer offline download at a time. Mirrors
 * `useMushafDownload` but operates on one `TafseerKey` (each tafseer
 * JSON is one ~3 MB file instead of 604 small files, so there's no
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

import { useCallback, useMemo, useRef } from 'react';

import { useAtom } from 'jotai';

import { TafseerKey } from '@/constants/TafseerCdn';
import {
  deleteTafseer,
  downloadTafseer,
  isTafseerCached,
} from '@/utils/downloads';
import { DownloadProgress, resourceKeyOf } from '@/utils/downloads/types';

// The download progress atom is owned by useMushafDownload; consumers
// can import `downloadProgressAtom` / `useDownloadProgress` from
// `@/hooks` (they're re-exported via the hooks barrel).
import { downloadProgressAtom } from './useMushafDownload';

// -- the hook --------------------------------------------------------
export function useTafseerDownload() {
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

  const startTafseer = useCallback(
    async (key: TafseerKey): Promise<void> => {
      if (abortRef.current) {
        throw new Error('تنزيل آخر قيد التقدم بالفعل.');
      }
      const id = resourceKeyOf({ kind: 'tafseer', key });
      const abort = new AbortController();
      abortRef.current = abort;

      // Skip if already on disk.
      if (await isTafseerCached(key)) {
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

      try {
        if (abort.signal.aborted) {
          setProgressMap((prev) => ({
            ...prev,
            [id]: { downloaded: 0, total: 1, status: 'cancelled' },
          }));
          return;
        }
        await downloadTafseer(key, abort.signal);
        if (abort.signal.aborted) {
          setProgressMap((prev) => ({
            ...prev,
            [id]: { downloaded: 0, total: 1, status: 'cancelled' },
          }));
          return;
        }
        const final: DownloadProgress = {
          downloaded: 1,
          total: 1,
          status: 'done',
        };
        setProgressMap((prev) => ({ ...prev, [id]: final }));
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
    startTafseer,
    cancel,
    isBusy,
    progress: progressMap,
    deleteTafseer: useCallback((key: TafseerKey) => deleteTafseer(key), []),
  };
}
