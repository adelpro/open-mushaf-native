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
 *   }
 *
 * The hook owns the embedder lifecycle — lazy-loads on first AI-mode query,
 * caches across queries, and reports download progress via the returned
 * `downloadProgress` object.
 *
 * Morphology + word-map data are imported statically at module scope to match
 * the existing pattern in app/search.tsx (Metro bundles them once).
 */

import { useCallback, useEffect, useRef, useState } from 'react';

import type { MorphologyAya, QuranText, WordMap } from 'quran-search-engine';

import morphologyDataRaw from '@/assets/search/quran-morphology.json';
import wordMapJSON from '@/assets/search/word-map.json';
import { useQuranMetadata } from '@/hooks/useQuranMetadata';
import {
  getCachedModelPath,
  loadEmbedderModel,
} from '@/utils/aiSearch/loadEmbedderModel';
import { runHybridSearch } from '@/utils/aiSearch/runHybridSearch';
import type {
  DenseEmbedder,
  DownloadProgress,
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
};

// Module-level static data — Metro bundles these once and we never reload.
const MORPHOLOGY = morphologyDataRaw as unknown as MorphologyAya[];
const WORD_MAP = new Map(Object.entries(wordMapJSON)) as WordMap;

// Module-level embedder — survives component unmounts so we don't reload
// the 140 MB ONNX model on every visit to /search.
let EMBEDDER_REF: DenseEmbedder | null = null;
let MODEL_READY_REF = false;

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
  });

  const debounceRef = useRef<number | null>(null);
  const lastQueryRef = useRef<string>('');

  const ensureModel = useCallback(async (): Promise<DenseEmbedder | null> => {
    if (EMBEDDER_REF) return EMBEDDER_REF;
    if (!getCachedModelPath()) return null;

    try {
      const embedder = await loadEmbedderModel({
        onProgress: (p: DownloadProgress) => {
          setState((s) => ({ ...s, downloadProgress: p }));
        },
      });
      EMBEDDER_REF = embedder;
      MODEL_READY_REF = true;
      setState((s) => ({
        ...s,
        isModelReady: true,
        downloadProgress: null,
      }));
      return embedder;
    } catch (err) {
      MODEL_READY_REF = false;
      setState((s) => ({
        ...s,
        isModelReady: false,
        downloadProgress: null,
        error: err instanceof Error ? err.message : String(err),
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
        }));
      } catch (err) {
        if (lastQueryRef.current !== query) return;
        setState((s) => ({
          ...s,
          results: [],
          total: 0,
          isLoading: false,
          error: err instanceof Error ? err.message : String(err),
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
