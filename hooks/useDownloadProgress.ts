/**
 * Shared in-memory atom + read accessor for download progress.
 *
 * Originally lived in `useMushafDownload.ts` and was imported directly
 * by `useTafseerDownload.ts`. After the SVG/mushaf-download cut
 * (Phase 0 of the qurani.ai integration plan) `useMushafDownload` is
 * gone; the atom migrates here so both `useTafseerDownload` and
 * `useNarrationDownload` (Phase 2) can write into the same map and
 * the Downloads UI can render one unified progress overlay.
 *
 * Not persisted: progress is a session-scoped concern. Successful
 * downloads update `downloadedNarrations` / `downloadedTafseers`
 * (MMKV-backed atoms) instead.
 */

import { atom, useAtomValue } from 'jotai';

import { ProgressMap } from '@/utils/downloads/types';

/** Reactive download-progress record, keyed by `ResourceKey`. */
export const downloadProgressAtom = atom<ProgressMap>({});

/**
 * Read-only accessor — components that just want to render progress
 * without driving a download import this hook.
 */
export function useDownloadProgress(): ProgressMap {
  return useAtomValue(downloadProgressAtom);
}
