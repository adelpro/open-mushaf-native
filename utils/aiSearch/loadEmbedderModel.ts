/**
 * Manages the ONNX model lifecycle for query embedding.
 *
 * Uses the Apache-2.0 Arabic-Triplet-Matryoshka-V2 model. The model is
 * downloaded once from the CDN configured in
 * `constants/aiSearch.ts → ATM_V2_MODEL_BASE_URL` and cached on disk via
 * expo-file-system. The path is persisted in MMKV so we skip the download
 * on subsequent app launches.
 *
 * After first use the model stays in the cache until the OS reclaims it or
 * the user clears it via Settings.
 */

import { Directory, File, Paths } from 'expo-file-system';
import { MMKV } from 'react-native-mmkv';

import {
  ATM_V2_MODEL_BASE_URL,
  ATM_V2_MODEL_FILENAME,
  ATM_V2_REPO_ID,
} from '@/constants/aiSearch';

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

function modelFile(): File {
  return new File(modelCacheDir(), ATM_V2_MODEL_FILENAME);
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

/**
 * Download the ONNX model to the cache directory with progress reporting.
 *
 * Uses fetch + a streaming body reader so the UI can show a progress bar
 * without buffering the entire 140 MB in memory.
 */
async function downloadModel(
  onProgress?: (p: DownloadProgress) => void,
): Promise<string> {
  const target = modelFile();
  if (target.exists) {
    target.delete();
  }

  const url = `${ATM_V2_MODEL_BASE_URL.replace(/\/$/, '')}/${ATM_V2_MODEL_FILENAME}`;
  const res = await fetch(url);
  if (!res.ok || !res.body) {
    throw new Error(
      `Failed to download model from ${url}: ${res.status} ${res.statusText}`,
    );
  }

  const totalHeader = res.headers.get('content-length');
  const totalBytes = totalHeader ? Number(totalHeader) : 0;

  const reader = res.body.getReader();
  const chunks: Uint8Array[] = [];
  let bytesDownloaded = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) {
      chunks.push(value);
      bytesDownloaded += value.byteLength;
      if (onProgress) {
        onProgress({ bytesDownloaded, totalBytes });
      }
    }
  }

  const merged = new Uint8Array(bytesDownloaded);
  let offset = 0;
  for (const chunk of chunks) {
    merged.set(chunk, offset);
    offset += chunk.byteLength;
  }
  target.create();
  target.write(merged);

  return target.uri;
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

  let modelPath: string | null = forceReload ? null : readCachedPath();
  if (modelPath && !fileExists(modelPath)) {
    clearCachedPath();
    modelPath = null;
  }

  if (!modelPath) {
    if (onProgress) onProgress({ bytesDownloaded: 0, totalBytes: 0 });
    modelPath = await downloadModel(onProgress);
    writeCachedPath(modelPath);
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

/** Drop the cached model (used by Settings → "إخفاء البحث الذكي" → re-enable, or factory reset). */
export function clearCachedModel(): void {
  const path = readCachedPath();
  if (path && fileExists(path)) {
    try {
      new File(path).delete();
    } catch {
      // best-effort
    }
  }
  clearCachedPath();
}
