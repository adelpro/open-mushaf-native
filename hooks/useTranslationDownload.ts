/**
 * Hook for managing a single translation offline download at a time.
 * Mirrors `useTafseerDownload` but for translations.
 *
 *   const { startTranslation, cancel, isBusy } = useTranslationDownload();
 *   await startTranslation('en.sahih');
 *
 * The hook writes through `downloadProgressAtom`, shared with
 * `useTafseerDownload` and `useRiwayaDownload`, so the Downloads
 * page renders one unified progress overlay.
 *
 * Cancel is honored via `AbortSignal` so the Cancel chip on the
 * Downloads UI actually kills the in-flight fetch (not just stops
 * new work).
 */

import { useCallback, useMemo, useRef } from 'react';

import { useAtom } from 'jotai';

import type { TranslationKey } from '@/constants/translations';
import { downloadProgressAtom } from '@/hooks/useDownloadProgress';
import { getCompleteQuran } from '@/utils/api/qurani';
import {
  deleteTranslation,
  isTranslationCached,
  persistTranslation,
} from '@/utils/api/qurani/cache';
import { DownloadProgress, resourceKeyOf } from '@/utils/downloads/types';

export function useTranslationDownload() {
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

  const startTranslation = useCallback(
    async (id: TranslationKey): Promise<void> => {
      if (abortRef.current) {
        throw new Error('تنزيل آخر قيد التقدم بالفعل.');
      }
      const key = resourceKeyOf({ kind: 'translation', id });
      const abort = new AbortController();
      abortRef.current = abort;

      // Skip if already on disk.
      if (await isTranslationCached(id)) {
        setProgressMap((prev) => ({
          ...prev,
          [key]: { downloaded: 1, total: 1, status: 'done' },
        }));
        return;
      }

      setProgressMap((prev) => ({
        ...prev,
        [key]: { downloaded: 0, total: 1, status: 'downloading' },
      }));

      try {
        if (abort.signal.aborted) {
          setProgressMap((prev) => ({
            ...prev,
            [key]: { downloaded: 0, total: 1, status: 'cancelled' },
          }));
          return;
        }
        // Fetch the full translation bundle from qurani.ai.
        const surahs = await getCompleteQuran(id, abort.signal);
        if (abort.signal.aborted) {
          setProgressMap((prev) => ({
            ...prev,
            [key]: { downloaded: 0, total: 1, status: 'cancelled' },
          }));
          return;
        }
        const json = JSON.stringify(surahs);
        await persistTranslation(id, json);
        if (abort.signal.aborted) {
          setProgressMap((prev) => ({
            ...prev,
            [key]: { downloaded: 0, total: 1, status: 'cancelled' },
          }));
          return;
        }
        const final: DownloadProgress = {
          downloaded: 1,
          total: 1,
          status: 'done',
        };
        setProgressMap((prev) => ({ ...prev, [key]: final }));
      } catch (err) {
        if (abort.signal.aborted) {
          setProgressMap((prev) => ({
            ...prev,
            [key]: { downloaded: 0, total: 1, status: 'cancelled' },
          }));
          return;
        }
        setProgressMap((prev) => ({
          ...prev,
          [key]: {
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
    startTranslation,
    cancel,
    isBusy,
    progress: progressMap,
    deleteTranslation: useCallback(
      (id: TranslationKey) => deleteTranslation(id),
      [],
    ),
  };
}
