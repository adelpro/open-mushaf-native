/**
 * Shared types for the offline-download module. No platform code lives
 * here, so the file is bundled into iOS, Android, and web equally.
 */

import type { TafseerKey } from '@/constants/TafseerCdn';
import type { TranslationKey } from '@/constants/translations';
import type { Riwaya } from '@/types';

/** A resource the user can download for offline reading. */
export type DownloadableResource =
  | { kind: 'riwaya'; riwaya: Riwaya }
  | { kind: 'tafseer'; key: TafseerKey }
  | { kind: 'translation'; id: TranslationKey };

/** Stable string key for the resource, suitable as a Map/Record key or atom lookup. */
export type ResourceKey =
  | `riwaya:${Riwaya}`
  | `tafseer:${TafseerKey}`
  | `translation:${TranslationKey}`;

export function resourceKeyOf(r: DownloadableResource): ResourceKey {
  switch (r.kind) {
    case 'riwaya':
      return `riwaya:${r.riwaya}`;
    case 'tafseer':
      return `tafseer:${r.key}`;
    case 'translation':
      return `translation:${r.id}`;
  }
}

export function resourceLabel(r: DownloadableResource): string {
  switch (r.kind) {
    case 'riwaya':
      return r.riwaya;
    case 'tafseer':
      return r.key;
    case 'translation':
      return r.id;
  }
}

/** Status of a download in flight or completed. */
export type DownloadStatus =
  'idle' | 'queued' | 'downloading' | 'done' | 'error' | 'cancelled';

/** Per-resource progress reported by the downloader. */
export interface DownloadProgress {
  /** Bytes downloaded so far (best estimate). */
  downloaded: number;
  /** Total bytes for this resource (best estimate). */
  total: number;
  status: DownloadStatus;
  error?: string;
}

/** Aggregated bytes used by offline downloads, per resource kind. */
export interface SizeSnapshot {
  totalBytes: number;
  byRiwaya: Record<Riwaya, number>;
  byTafseer: Partial<Record<TafseerKey, number>>;
  byTranslation: Record<TranslationKey, number>;
}

/** Live progress keyed by resource key; optional because not every
 *  resource has an entry at all times. */
export type ProgressMap = Partial<Record<ResourceKey, DownloadProgress>>;
