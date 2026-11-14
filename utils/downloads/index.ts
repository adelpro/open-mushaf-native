// Metro selects the platform implementation without importing native code on web.
export * from './downloads';

export {
  RIWAYA_PAGE_COUNTS,
  RIWAYA_SIZE_ESTIMATE_BYTES,
  TAFSEER_SIZE_ESTIMATE_BYTES,
  SVG_PAGE_BYTES_ESTIMATE,
  formatBytes,
} from './shared';

export type {
  DownloadableResource,
  ResourceKey,
  DownloadStatus,
  DownloadProgress,
  SizeSnapshot,
} from './types';

export { resourceKeyOf, resourceLabel } from './types';
