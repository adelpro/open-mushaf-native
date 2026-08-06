/**
 * React hook for the AI hybrid search.
 *
 * Mirrors the shape of useQuranSearch so the SearchInput + result list code
 * can be reused without rewiring:
 *
 *   {
 *     results,        // HybridResult[]
 *     counts: { total },
 *     isLoading,
 *     error,
 *     availability: { keyword, dense },
 *     usedDense,
 *     isModelReady,
 *     downloadProgress,
 *     failureReason,  // typed cause for the banner
 *   }
 *
 * The hook owns the embedder lifecycle — lazy-loads on first AI-mode query,
 * caches across queries, and reports download progress via the returned
 * `downloadProgress` object. Failures are classified into a typed
 * `failureReason` so the UI can surface a specific message instead of the
 * generic "not ready" string.
 *
 * Morphology + word-map data are imported statically at module scope to match
 * the existing pattern in app/search.tsx (Metro bundles them once).
 */

import { useCallback, useEffect, useRef, useState } from 'react';

import type { MorphologyAya, QuranText, WordMap } from 'quran-search-engine';

import morphologyDataRaw from '@/assets/search/quran-morphology.json';
import wordMapJSON from '@/assets/search/word-map.json';
import { useQuranMetadata } from '@/hooks/useQuranMetadata';
import { logEvent } from '@/utils/aiSearch/debugLog';
import {
  clearCachedModel,
  loadEmbedderModel,
} from '@/utils/aiSearch/loadEmbedderModel';
import { runHybridSearch } from '@/utils/aiSearch/runHybridSearch';
import type {
  DenseEmbedder,
  DownloadProgress,
  FailureReason,
  HybridResponse,
  HybridResult,
  LayerAvailability,
} from '@/utils/aiSearch/types';

export type UseHybridSearchState = {
  results: HybridResult[];
  total: number;
  isLoading: boolean;
  error: string | null;
  availability: LayerAvailability;
  usedDense: boolean;
  isModelReady: boolean;
  downloadProgress: DownloadProgress | null;
  /**
   * Categorised reason the model is unavailable. Surfaces in the banner so
   * the user sees a specific cause instead of a generic message.
   */
  failureReason: FailureReason;
};

// Module-level static data — Metro bundles these once and we never reload.
const MORPHOLOGY = morphologyDataRaw as unknown as MorphologyAya[];
const WORD_MAP = new Map(Object.entries(wordMapJSON)) as WordMap;

// Module-level embedder — survives component unmounts so we don't reload
// the 140 MB ONNX model on every visit to /search.
let EMBEDDER_REF: DenseEmbedder | null = null;
let MODEL_READY_REF = false;

/**
 * Categorise an error message thrown from the AI-search pipeline into a
 * `FailureReason` for the UI banner. Matches against the known error
 * substrings emitted by `loadEmbedderModel.ts` and `embedderRuntime.ts`.
 *
 * Order matters — 'cdn-blocked' and 'model-load' both come from
 * `embedderRuntime.web.ts` and share substrings with cross-platform errors,
 * so we check web-specific patterns first when the message looks web-shaped.
 */
function classifyError(message: string): FailureReason {
  // Web CDN fetch failures. The loader script prepends `cdn-blocked:`
  // (see utils/aiSearch/embedderRuntime.web.ts → loadTransformers).
  if (
    /^cdn-blocked:/.test(message) ||
    /jsdelivr|NetworkError|CORS/i.test(message)
  ) {
    return 'cdn-blocked';
  }
  // Web model fetch failures (HF repo 404, missing config.json, etc.).
  // The embed() wrapper also tags these as `model-load: …`.
  // transformers.js itself throws "Unauthorized access to file: …" with the
  // failing URL when the HF repo is missing or private — most reliable
  // signal we have on the first attempt, before our wrappers get a chance
  // to retag.
  if (
    /^model-load:/.test(message) ||
    /Unauthorized access to file|model_quantized|config\.json|HTTP 4\d\d/i.test(
      message,
    )
  ) {
    return 'model-load';
  }
  // Web WASM init / runtime aborts.
  if (/^wasm-init:/.test(message) || /wasm|WebAssembly|abort/i.test(message)) {
    return 'wasm-init';
  }

  // Cross-platform / native.
  if (message.includes('tokenizer.json missing')) return 'tokenizer-missing';
  if (message.startsWith('Failed to download')) return 'download-failed';
  if (
    /OPFS|quota|FileSystem|expo-file-system/i.test(message) &&
    !message.includes('Failed to download')
  ) {
    return 'opfs-failed';
  }
  if (
    message.includes('onnxruntime-react-native') ||
    message.includes('@huggingface/transformers') ||
    message.includes('Embedder runtime not initialized') ||
    message.includes('Native AI search requires')
  ) {
    return 'runtime-init';
  }
  return 'unknown';
}

/**
 * Debounced hybrid search driven by the Quran metadata + (lazily) the
 * Arabic-Triplet-Matryoshka-V2 ONNX model.
 */
export function useHybridSearch({
  query,
  debounceMs = 400,
}: {
  query: string;
  debounceMs?: number;
}): UseHybridSearchState {
  const { quranData, isLoading: metadataLoading } = useQuranMetadata();

  const [state, setState] = useState<UseHybridSearchState>({
    results: [],
    total: 0,
    isLoading: false,
    error: null,
    availability: { keyword: true, dense: false },
    usedDense: false,
    isModelReady: MODEL_READY_REF,
    downloadProgress: null,
    failureReason: null,
  });

  const debounceRef = useRef<number | null>(null);
  const lastQueryRef = useRef<string>('');

  const ensureModel = useCallback(async (): Promise<DenseEmbedder | null> => {
    if (EMBEDDER_REF) return EMBEDDER_REF;

    try {
      const embedder = await loadEmbedderModel({
        onProgress: (p: DownloadProgress) => {
          setState((s) => ({ ...s, downloadProgress: p }));
        },
      });
      // Module-level cache intentionally survives unmounts — see top-of-file.
      // eslint-disable-next-line react-compiler/react-compiler
      EMBEDDER_REF = embedder;
      MODEL_READY_REF = true;
      setState((s) => ({
        ...s,
        isModelReady: true,
        downloadProgress: null,
        failureReason: null,
      }));
      return embedder;
    } catch (err) {
      MODEL_READY_REF = false;
      const message = err instanceof Error ? err.message : String(err);
      const reason = classifyError(message);
      logEvent('error', 'ensureModel failed', { reason, message });
      setState((s) => ({
        ...s,
        isModelReady: false,
        downloadProgress: null,
        error: message,
        failureReason: reason,
      }));
      return null;
    }
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setState((s) => ({
        ...s,
        results: [],
        total: 0,
        isLoading: false,
        error: null,
      }));
      return;
    }

    if (metadataLoading || !quranData || quranData.length === 0) return;

    if (debounceRef.current) {
      window.clearTimeout(debounceRef.current);
    }

    setState((s) => ({ ...s, isLoading: true, error: null }));

    debounceRef.current = window.setTimeout(async () => {
      lastQueryRef.current = query;
      try {
        const embedder = await ensureModel();
        const response: HybridResponse = await runHybridSearch({
          query,
          quranData: quranData as QuranText[],
          morphologyData: MORPHOLOGY,
          wordMap: WORD_MAP,
          embedder,
        });
        if (lastQueryRef.current !== query) return;
        setState((s) => ({
          ...s,
          results: response.results,
          total: response.total,
          isLoading: false,
          error: null,
          availability: response.availability,
          usedDense: response.usedDense,
          isModelReady: MODEL_READY_REF,
          downloadProgress: null,
          failureReason: response.denseFailure ? 'unknown' : null,
        }));
      } catch (err) {
        if (lastQueryRef.current !== query) return;
        const message = err instanceof Error ? err.message : String(err);
        const reason = classifyError(message);
        logEvent('error', 'runHybridSearch failed', { reason, message });
        setState((s) => ({
          ...s,
          results: [],
          total: 0,
          isLoading: false,
          error: message,
          failureReason: reason,
        }));
      }
    }, debounceMs);

    return () => {
      if (debounceRef.current) {
        window.clearTimeout(debounceRef.current);
        debounceRef.current = null;
      }
    };
  }, [query, debounceMs, metadataLoading, quranData, ensureModel]);

  return state;
}

// Internal: allow tests to reset module-level embedder cache.
export function __resetHybridEmbedderForTests(): void {
  EMBEDDER_REF?.dispose();
  EMBEDDER_REF = null;
  MODEL_READY_REF = false;
}

/**
 * Drop the cached model file, the tokenizer siblings, and the debug log so
 * the next AI query starts from a clean slate. Wired to the "إعادة المحاولة"
 * button in `app/search.tsx`.
 */
export async function retryHybridEmbedder(): Promise<void> {
  logEvent('info', 'retryHybridEmbedder: user-initiated reset');
  EMBEDDER_REF?.dispose();
  EMBEDDER_REF = null;
  MODEL_READY_REF = false;
  clearCachedModel();
}
