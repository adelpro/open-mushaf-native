/**
 * Shared types for the AI semantic search subsystem.
 *
 * The runtime is composed of two retrieval paths that run in parallel:
 *   - keyword (existing quran-search-engine)
 *   - dense   (ATM-V2 ONNX model + bundled verse vectors)
 *
 * Both produce a `Map<gid, rank>` which is fused by RRF in runHybridSearch.ts.
 */

export type SearchMode = 'keyword' | 'ai';

/** A single verse's metadata, mirrored from assets/ai-search/quran_vectors_meta.json. */
export type VerseVectorMeta = {
  gid: number;
  sura_id: number;
  aya_id: number;
  text_uthmani: string;
  text_clean: string;
};

/**
 * The bundled vector index loaded from assets/ai-search/.
 *
 * `vectors` is a contiguous Int8Array of length `count * dim`.
 * Row `gid - 1` (1-based gid, 0-based index) covers bytes `[gid*dim, (gid+1)*dim)`.
 */
export type VectorIndex = {
  vectors: Int8Array;
  meta: VerseVectorMeta[];
  dim: number;
  count: number;
};

/**
 * A dense embedder wraps an ONNX session and exposes `embed(text) → Float32Array`
 * in the same numeric space as the bundled index (int8 range, L2-normalized).
 */
export type DenseEmbedder = {
  embed(text: string): Promise<Float32Array>;
  dispose(): void;
};

export type ModelStatus = 'idle' | 'downloading' | 'ready' | 'error';

export type LayerAvailability = {
  keyword: boolean;
  dense: boolean;
};

/** A fused ranking result ready for the UI. */
export type HybridResult = {
  gid: number;
  sura_id: number;
  aya_id: number;
  text_uthmani: string;
  text_clean: string;
  score: number;
  rank: number;
  sources: ('keyword' | 'dense')[];
  /** Trimmed Tafseer Al-Muyassar snippet (only present when dense path is active). */
  tafseer_snippet: string;
};

export type HybridResponse = {
  results: HybridResult[];
  /** Number of unique gids ranked. */
  total: number;
  availability: LayerAvailability;
  /** True when the dense path contributed at least one ranking. */
  usedDense: boolean;
};

/** Snapshot of progress for the model download UI. */
export type DownloadProgress = {
  bytesDownloaded: number;
  totalBytes: number;
};
