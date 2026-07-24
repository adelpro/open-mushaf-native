/**
 * Hook for managing a single tafseer offline download at a time.
 *
 *   const { startTafseer, cancel, isBusy, progress } = useTafseerDownload();
 *   await startTafseer('muyassar');
 *
 * Each tafseer JSON is one ~3 MB file — there's no loop, just a
 * single fetch + persist. Writes go through `downloadProgressAtom`,
 * shared with `useRiwayaDownload` so the Downloads page renders one
 * unified progress overlay.
 *
 * Phase 3 keeps the static-CDN path (`cdn.jsdelivr.net/.../assets/
 * tafaseer/<key>.json`) and the per-tafseer `{id, sura, aya, text}`
 * JSON shape. Phase 4 will introduce `useQuranTafseerDownload` for
 * the 50+ qurani.ai tafseers (separate hook, separate storage path
 * under `Paths.document/open-mushaf/tafseer/<edition-id>.json`).
 * The `tafseer` resource kind in `utils/downloads/types.ts` already
 * accommodates both: a single hook per source keeps the Downloads UI
 * list easy to render.
 *
 * Cancel is honored via `AbortSignal` so the Cancel chip on the
 * Downloads UI actually kills the in-flight fetch (not just stops
 * new work).
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

// The download progress atom now lives in `useDownloadProgress.ts`
// (extracted from the deleted `useMushafDownload.ts`). Consumers can
// still import `downloadProgressAtom` / `useDownloadProgress` from
// `@/hooks` via the hooks barrel.
import { downloadProgressAtom } from './useDownloadProgress';

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
