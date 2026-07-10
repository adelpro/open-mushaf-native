/**
 * Public entrypoint for the offline-download module. Metro picks the
 * right per-platform implementation by resolving `./downloads`:
 *   - iOS/Android: `./downloads.ts` (expo-file-system, current)
 *   - Web:        `./downloads.web.ts` (added in Phase 5 with Cache API)
 *
 * Until Phase 5, importing on web will throw because `./downloads.web.ts`
 * does not yet exist — that's intentional. The downloads UI is hidden
 * on web until Phase 5 wires up the SW + Cache API parity.
 */

export {
  isMushafPageCached,
  readMushafPageFromDisk,
  persistMushafPage,
  downloadMushafPage,
  getMushafRiwayaDownloadedPages,
  getMushafRiwayaDirSizeBytes,
  deleteMushafRiwaya,
  riwayaTotalPages,
  riwayaEstimatedBytes,
  isTafseerCached,
  readTafseerFromDisk,
  persistTafseer,
  downloadTafseer,
  getTafseerFileSizeBytes,
  deleteTafseer,
  getStorageSnapshot,
} from './downloads';

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
