/**
 * Public entrypoint for the open-mushaf app's qurani.ai cache
 * module. Runtime-dispatched between native (expo-file-system) and
 * web (Cache API) the same way `utils/downloads/index.ts` is.
 *
 * All storage lives under the `open-mushaf/` namespace — see the
 * file headers in `native.ts` / `web.ts` for the exact layout.
 *
 * Callers (e.g. `useRiwayaCache`, `useTranslation`,
 * `useRiwayaDownload`) should import from `@/utils/api/qurani/cache`
 * and never reach into `native.ts` / `web.ts` / `translations.*`
 * directly.
 */

import { Platform } from 'react-native';

import * as nativeImpl from './native';
import * as translationNativeImpl from './translations.native';
import * as translationWebImpl from './translations.web';
import * as webImpl from './web';

const impl = Platform.OS === 'web' ? webImpl : nativeImpl;
const translationImpl =
  Platform.OS === 'web' ? translationWebImpl : translationNativeImpl;

export const isRiwayaBundleCached = impl.isRiwayaBundleCached;
export const readRiwayaBundleFromDisk = impl.readRiwayaBundleFromDisk;
export const persistRiwayaBundle = impl.persistRiwayaBundle;
export const isPageSnapshotCached = impl.isPageSnapshotCached;
export const readPageSnapshotFromDisk = impl.readPageSnapshotFromDisk;
export const persistPageSnapshot = impl.persistPageSnapshot;
export const deleteRiwaya = impl.deleteRiwaya;
export const getRiwayaBundleBytes = impl.getRiwayaBundleBytes;

export const isTranslationCached = translationImpl.isTranslationCached;
export const readTranslationFromDisk = translationImpl.readTranslationFromDisk;
export const persistTranslation = translationImpl.persistTranslation;
export const deleteTranslation = translationImpl.deleteTranslation;
export const getTranslationBytes = translationImpl.getTranslationBytes;
