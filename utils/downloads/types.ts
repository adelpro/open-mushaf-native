/**
 * Shared types for the offline-download module. No platform code lives
 * here, so the file is bundled into iOS, Android, and web equally.
 */

import type { TafseerKey } from '@/constants/TafseerCdn';
import type { Riwaya } from '@/types';

/** A resource the user can download for offline reading. */
export type DownloadableResource =
  { kind: 'mushaf'; riwaya: Riwaya } | { kind: 'tafseer'; key: TafseerKey };

/** Stable string key for the resource, suitable as a Map/Record key or atom lookup. */
export type ResourceKey = `mushaf:${Riwaya}` | `tafseer:${TafseerKey}`;

export function resourceKeyOf(r: DownloadableResource): ResourceKey {
  return r.kind === 'mushaf' ? `mushaf:${r.riwaya}` : `tafseer:${r.key}`;
}

export function resourceLabel(r: DownloadableResource): string {
  return r.kind === 'mushaf' ? r.riwaya : r.key;
}

/** Status of a download in flight or completed. */
export type DownloadStatus =
  'idle' | 'queued' | 'downloading' | 'done' | 'error' | 'cancelled';

/** Per-resource progress reported by the downloader. */
export interface DownloadProgress {
  /** Number of pages downloaded so far (for mushaf) or 0/1 for tafseer. */
  downloaded: number;
  /** Total pages (mushaf) or 1 (tafseer). */
  total: number;
  status: DownloadStatus;
  /** Bytes downloaded so far, when known. */
  bytes?: number;
  error?: string;
}

/** Aggregated bytes used by offline downloads, per resource kind. */
export interface SizeSnapshot {
  totalBytes: number;
  byRiwaya: Partial<Record<Riwaya, number>>;
  byTafseer: Partial<Record<TafseerKey, number>>;
}

/** Live progress keyed by resource key; optional because not every
 *  resource has an entry at all times. */
export type ProgressMap = Partial<Record<ResourceKey, DownloadProgress>>;
