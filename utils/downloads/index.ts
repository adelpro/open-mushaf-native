/**
 * Public entrypoint for the offline-download module. Runtime
 * dispatch between implementations because Metro's platform-
 * extension resolution (`downloads.web.ts` / `downloads.native.ts`)
 * isn't reflected in the TypeScript module resolver. Both sibling
 * files share an identical signature so `index.ts` picks one at
 * module-load time based on `Platform.OS`.
 *
 * On web, the hooks speak the Cache API + `navigator.storage.
 * estimate()`; on native they speak `expo-file-system` v57.
 */

import { Platform } from 'react-native';

import * as nativeImpl from './downloads.native';
import * as webImpl from './downloads.web';

const impl = Platform.OS === 'web' ? webImpl : nativeImpl;

export const isMushafPageCached = impl.isMushafPageCached;
export const readMushafPageFromDisk = impl.readMushafPageFromDisk;
export const persistMushafPage = impl.persistMushafPage;
export const downloadMushafPage = impl.downloadMushafPage;
export const getMushafRiwayaDownloadedPages =
  impl.getMushafRiwayaDownloadedPages;
export const getMushafRiwayaDirSizeBytes = impl.getMushafRiwayaDirSizeBytes;
export const deleteMushafRiwaya = impl.deleteMushafRiwaya;
export const riwayaTotalPages = impl.riwayaTotalPages;
export const riwayaEstimatedBytes = impl.riwayaEstimatedBytes;
export const isTafseerCached = impl.isTafseerCached;
export const readTafseerFromDisk = impl.readTafseerFromDisk;
export const persistTafseer = impl.persistTafseer;
export const downloadTafseer = impl.downloadTafseer;
export const getTafseerFileSizeBytes = impl.getTafseerFileSizeBytes;
export const deleteTafseer = impl.deleteTafseer;
export const getStorageSnapshot = impl.getStorageSnapshot;

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
