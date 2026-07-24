/**
 * Public entrypoint for the qurani.ai translation cache. Runtime-
 * dispatched between native (expo-file-system) and web (Cache API).
 *
 * Consumers (`useTranslation`, `useTranslationDownload`,
 * `getStorageSnapshot`) import from this barrel.
 */

import { Platform } from 'react-native';

import * as nativeImpl from './translations.native';
import * as webImpl from './translations.web';

const impl = Platform.OS === 'web' ? webImpl : nativeImpl;

export const isTranslationCached = impl.isTranslationCached;
export const readTranslationFromDisk = impl.readTranslationFromDisk;
export const persistTranslation = impl.persistTranslation;
export const deleteTranslation = impl.deleteTranslation;
export const getTranslationBytes = impl.getTranslationBytes;
