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
 *
 * Per Phase 0 of the qurani.ai integration plan, the mushaf-SVG
 * download path is removed; only tafseer cache lives here now.
 * Narration text bundles are wired in `utils/api/qurani/cache/`
 * (Phase 2), re-exported below so consumers have a single barrel.
 */

import { Platform } from 'react-native';

import * as nativeImpl from './downloads.native';
import * as webImpl from './downloads.web';

const impl = Platform.OS === 'web' ? webImpl : nativeImpl;

export const isTafseerCached = impl.isTafseerCached;
export const readTafseerFromDisk = impl.readTafseerFromDisk;
export const persistTafseer = impl.persistTafseer;
export const downloadTafseer = impl.downloadTafseer;
export const getTafseerFileSizeBytes = impl.getTafseerFileSizeBytes;
export const deleteTafseer = impl.deleteTafseer;

/* Riwaya cache helpers (Phase 2). Re-exported from
 * `utils/api/qurani/cache` so consumers have a single download barrel. */
export {
  isRiwayaBundleCached,
  readRiwayaBundleFromDisk,
  persistRiwayaBundle,
  deleteRiwaya,
  getRiwayaBundleBytes,
} from '@/utils/api/qurani/cache';

export const getStorageSnapshot = impl.getStorageSnapshot;

export {
  NARRATION_SIZE_ESTIMATE_BYTES,
  TAFSEER_SIZE_ESTIMATE_BYTES,
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
