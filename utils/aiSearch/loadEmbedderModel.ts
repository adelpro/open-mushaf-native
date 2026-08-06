/**
 * Manages the ONNX model lifecycle for query embedding.
 *
 * Uses the Apache-2.0 Arabic-Triplet-Matryoshka-V2 model. On native the
 * model + tokenizer files are downloaded once from the CDN configured in
 * `constants/aiSearch.ts → ATM_V2_MODEL_BASE_URL` and cached on disk via
 * expo-file-system. The path is persisted in MMKV so we skip the download
 * on subsequent app launches.
 *
 * On web we skip the local download entirely — `@huggingface/transformers`
 * re-fetches the model from the HF repo on its own and ignores the path
 * argument. This avoids the Safari / OPFS hazards of expo-file-system v19.
 *
 * After first use the model stays in the cache until the OS reclaims it or
 * the user clears it via Settings → "إعادة تعيين البحث الذكي".
 */

import { Directory, File, Paths } from 'expo-file-system';
import { MMKV } from 'react-native-mmkv';

import {
  AI_SEARCH_CDN_FILES,
  ATM_V2_MODEL_BASE_URL,
  ATM_V2_MODEL_FILENAME,
  ATM_V2_REPO_ID,
  ATM_V2_WEB_REPO_ID,
} from '@/constants/aiSearch';
import { isWeb } from '@/utils/isWeb';

import { clearDebugLog, logEvent } from './debugLog';
import type { DenseEmbedder, DownloadProgress } from './types';

// Dedicated MMKV instance — keeps AI-search state isolated from user prefs.
const storage = new MMKV({ id: 'ai-search' });
const MODEL_PATH_KEY = 'modelPath';
const CACHE_DIRNAME = 'ai-search-model';

/** Build the platform-correct cache directory for the model. */
function modelCacheDir(): Directory {
  const dir = new Directory(Paths.cache, CACHE_DIRNAME);
  if (!dir.exists) {
    dir.create({ intermediates: true });
  }
  return dir;
}

function readCachedPath(): string | null {
  return storage.getString(MODEL_PATH_KEY) ?? null;
}

function writeCachedPath(path: string): void {
  storage.set(MODEL_PATH_KEY, path);
}

function clearCachedPath(): void {
  storage.delete(MODEL_PATH_KEY);
}

function fileExists(path: string): boolean {
  try {
    return new File(path).exists;
  } catch {
    return false;
  }
}

/** Does any of the required CDN files fail to exist on disk? */
function isCacheIncomplete(): boolean {
  const dir = modelCacheDir();
  for (const name of AI_SEARCH_CDN_FILES) {
    const f = new File(dir, name);
    if (!f.exists) return true;
  }
  return false;
}

/**
 * Stream-download a single file. Throws on non-OK responses.
 *
 * Caller is responsible for re-deleting any partial output files written
 * during the attempt when handling the error.
 */
async function downloadOne(
  url: string,
  target: File,
  onProgress?: (delta: number) => void,
): Promise<void> {
  const res = await fetch(url);
  if (!res.ok || !res.body) {
    throw new Error(
      `Failed to download from ${url}: ${res.status} ${res.statusText}`,
    );
  }

  const reader = res.body.getReader();
  const chunks: Uint8Array[] = [];
  let bytesDownloaded = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) {
      chunks.push(value);
      bytesDownloaded += value.byteLength;
      onProgress?.(value.byteLength);
    }
  }

  const merged = new Uint8Array(bytesDownloaded);
  let offset = 0;
  for (const chunk of chunks) {
    merged.set(chunk, offset);
    offset += chunk.byteLength;
  }
  if (!target.exists) target.create();
  target.write(merged);
}

/**
 * Download every file in `AI_SEARCH_CDN_FILES` into the cache directory.
 *
 * Tracks per-file progress. On any per-file failure, deletes the partial
 * files written during this attempt so a retry starts from a clean slate.
 */
async function downloadAllCdnFiles(
  onProgress?: (p: DownloadProgress) => void,
): Promise<string> {
  const dir = modelCacheDir();
  const baseUrl = ATM_V2_MODEL_BASE_URL.replace(/\/$/, '');
  const fileCount = AI_SEARCH_CDN_FILES.length;

  // Track which files were written during THIS attempt so we can clean up
  // partial state on error.
  const writtenThisAttempt: File[] = [];

  // Emit a single reset event so the UI clears stale progress.
  onProgress?.({ bytesDownloaded: 0, totalBytes: 0, fileIndex: 0, fileCount });

  for (let fileIndex = 0; fileIndex < fileCount; fileIndex++) {
    const name = AI_SEARCH_CDN_FILES[fileIndex];
    const url = `${baseUrl}/${name}`;
    const target = new File(dir, name);
    if (target.exists) {
      try {
        target.delete();
      } catch {
        // best-effort
      }
    }

    try {
      logEvent('info', 'downloading CDN file', { fileIndex, fileCount, name });
      await downloadOne(url, target, (delta) => {
        onProgress?.({
          bytesDownloaded: delta,
          totalBytes: 0,
          fileIndex,
          fileCount,
          fileName: name,
        });
      });
      writtenThisAttempt.push(target);
    } catch (err) {
      // Best-effort cleanup of any files written during this attempt.
      for (const f of writtenThisAttempt) {
        try {
          if (f.exists) f.delete();
        } catch {
          // ignore
        }
      }
      logEvent('error', 'CDN download failed', {
        fileIndex,
        fileCount,
        name,
        message: err instanceof Error ? err.message : String(err),
      });
      throw err;
    }
  }

  // Mark the download complete so the UI clears the spinner.
  onProgress?.({
    bytesDownloaded: 0,
    totalBytes: 0,
    fileIndex: fileCount,
    fileCount,
  });

  // The model file's absolute URI is what `ensureSession` and
  // `getCachedModelPath` need to find.
  const modelFile = new File(dir, ATM_V2_MODEL_FILENAME);
  return modelFile.uri;
}

/**
 * High-level loader: returns a ready-to-use embedder.
 *
 * @param onProgress  Optional callback for download progress.
 * @param forceReload If true, drop the cached path and re-download.
 */
export async function loadEmbedderModel(
  options: {
    onProgress?: (p: DownloadProgress) => void;
    forceReload?: boolean;
  } = {},
): Promise<DenseEmbedder> {
  const { onProgress, forceReload } = options;

  logEvent('info', 'loadEmbedderModel:start', {
    forceReload: !!forceReload,
    isWeb,
  });

  // Web: skip the local download entirely. @huggingface/transformers fetches
  // the model from the HF repo on its own and ignores `modelPath`. Saves
  // ~135 MB of OPFS writes and sidesteps Safari OPFS hazards.
  if (isWeb) {
    logEvent('info', 'loadEmbedderModel:web short-circuit');
    const runtime = await import('./embedderRuntime');
    return runtime.createEmbedder(null, ATM_V2_WEB_REPO_ID, onProgress);
  }

  let modelPath: string | null = forceReload ? null : readCachedPath();
  if (modelPath && (!fileExists(modelPath) || isCacheIncomplete())) {
    logEvent('warn', 'Cached model path stale — re-downloading', {
      reason: !fileExists(modelPath) ? 'model-missing' : 'sibling-missing',
    });
    clearCachedPath();
    modelPath = null;
  }

  if (!modelPath) {
    try {
      modelPath = await downloadAllCdnFiles(onProgress);
      writeCachedPath(modelPath);
      logEvent('info', 'model downloaded', { modelPath });
    } catch (err) {
      logEvent('error', 'model download failed', {
        message: err instanceof Error ? err.message : String(err),
      });
      throw err;
    }
  }

  // Dynamic-import so the ONNX runtime only loads when actually needed.
  const runtime = await import('./embedderRuntime');
  return runtime.createEmbedder(modelPath, ATM_V2_REPO_ID);
}

/** Returns the cached model path if it exists, otherwise null. Does not download. */
export function getCachedModelPath(): string | null {
  const path = readCachedPath();
  return path && fileExists(path) ? path : null;
}

/** Drop the cached model (used by Settings → "إعادة تعيين البحث الذكي"). */
export function clearCachedModel(): void {
  // On web there is no local cache to clear — @huggingface/transformers
  // stores the model in Cache Storage under the key `transformers-cache`
  // (see node_modules/@huggingface/transformers/src/env.js `cacheKey`).
  // Clearing that entry, plus the MMKV path key, plus the loader's
  // globalThis reference, forces the next attempt to re-download.
  if (isWeb) {
    if (typeof globalThis !== 'undefined') {
      const g = globalThis as unknown as {
        __transformers?: unknown;
        caches?: { delete: (key: string) => Promise<boolean> };
      };
      delete g.__transformers;
      if (g.caches) {
        void g.caches
          .delete('transformers-cache')
          .then((ok) => {
            logEvent('info', 'web Cache Storage cleared', { ok });
          })
          .catch((err: unknown) => {
            const msg = err instanceof Error ? err.message : String(err);
            logEvent('warn', 'web Cache Storage clear failed', { msg });
          });
      }
    }
    clearCachedPath();
    clearDebugLog();
    logEvent('info', 'cleared cached model + tokenizer (web short-circuit)');
    return;
  }
  // Native: walk the cache directory. `modelCacheDir` may throw on platforms
  // where expo-file-system's OPFS / cache backend is unavailable (e.g. some
  // web bundles that also export native code paths). Treat that as a no-op.
  let dir: Directory;
  try {
    dir = modelCacheDir();
  } catch (err) {
    logEvent('warn', 'modelCacheDir threw — skipping file delete', {
      message: err instanceof Error ? err.message : String(err),
    });
    clearCachedPath();
    clearDebugLog();
    return;
  }
  for (const name of AI_SEARCH_CDN_FILES) {
    const f = new File(dir, name);
    if (f.exists) {
      try {
        f.delete();
      } catch {
        // best-effort
      }
    }
  }
  clearCachedPath();
  clearDebugLog();
  logEvent('info', 'cleared cached model + tokenizer');
}

/** Drop only the persisted path key without touching files on disk. */
export function _resetCachedPathForTests(): void {
  clearCachedPath();
}
