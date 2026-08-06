/**
 * Pure cosine-similarity search over the bundled int8 vector index.
 *
 * Build-time pipeline (scripts/build_quran_vectordb.py):
 *   1. Compute fp32 L2-normalized embeddings (length-768).
 *   2. Multiply by 127, clamp to [-128, 127], round → int8.
 *
 * Runtime pipeline (utils/aiSearch/embedderRuntime.ts):
 *   1. Compute fp32 L2-normalized embeddings for the query (length-768).
 *   2. Returned as Float32Array in [-1, 1].
 *
 * Math: for two L2-normalized vectors u and v, cosine(u, v) = u · v.
 * Here we have u (query, fp32, ||u|| = 1) and v_stored = v × 127 (int8, ||v_stored|| = 127).
 * So cosine(u, v) = (u · v_stored) / (||u|| × ||v_stored||) = (u · v_stored) / 127.
 *
 * For maximum throughput we do one linear pass over the (count × dim) matrix.
 * At 6,236 × 768 that is ~4.8M multiply-adds ≈ 30-60 ms on a mid-range phone.
 * ANN indexing is not justified at this size; revisit if the corpus grows.
 */

import type { VectorIndex } from './types';

export type DenseMatch = {
  gid: number;
  score: number;
  rank: number;
};

// SCALE = 127 (the build-time quantization factor).
const SCALE = 127;

/**
 * Brute-force cosine top-K over the bundled index.
 *
 * @param queryVec  Float32Array of length `index.dim`, L2-normalized, components in [-1, 1].
 * @param index     The bundled vector index (already loaded).
 * @param topK      How many results to keep.
 * @param minScore  Discard matches below this cosine value (range [-1, 1]; use 0 for none).
 *
 * Returns matches sorted by descending score, ranked 1..topK.
 */
export function cosineSearch(
  queryVec: Float32Array,
  index: VectorIndex,
  topK: number,
  minScore: number,
): DenseMatch[] {
  const { vectors, dim, count } = index;
  if (queryVec.length !== dim) {
    throw new Error(
      `queryVec length (${queryVec.length}) does not match index dim (${dim})`,
    );
  }

  // Keep a tiny partial-sort heap of size topK. For 6,236 rows × 768 dims this
  // is still much faster than sorting the whole array.
  const heap: DenseMatch[] = [];

  for (let gid = 1; gid <= count; gid++) {
    const rowStart = (gid - 1) * dim;
    let acc = 0;
    for (let i = 0; i < dim; i++) {
      acc += queryVec[i] * vectors[rowStart + i];
    }
    // Stored rows are L2-normalized fp32 × 127 → ||row|| ≈ 127.
    // Query is L2-normalized fp32 → ||query|| ≈ 1.
    // cosine = dot / (||query|| × ||row||) = dot / 127.
    const score = acc / SCALE;
    if (score < minScore) continue;

    if (heap.length < topK) {
      heap.push({ gid, score, rank: 0 });
      bubbleUp(heap, heap.length - 1);
    } else if (score > heap[0].score) {
      heap[0] = { gid, score, rank: 0 };
      siftDown(heap, 0);
    }
  }

  heap.sort((a, b) => b.score - a.score);
  return heap.map((m, i) => ({ ...m, rank: i + 1 }));
}

// Min-heap helpers (smallest score at root). Used to keep the top-K without
// sorting the entire candidate set.

function bubbleUp(heap: DenseMatch[], i: number): void {
  while (i > 0) {
    const parent = (i - 1) >> 1;
    if (heap[parent].score <= heap[i].score) break;
    [heap[parent], heap[i]] = [heap[i], heap[parent]];
    i = parent;
  }
}

function siftDown(heap: DenseMatch[], i: number): void {
  const n = heap.length;

  while (true) {
    const l = 2 * i + 1;
    const r = 2 * i + 2;
    let smallest = i;
    if (l < n && heap[l].score < heap[smallest].score) smallest = l;
    if (r < n && heap[r].score < heap[smallest].score) smallest = r;
    if (smallest === i) break;
    [heap[smallest], heap[i]] = [heap[i], heap[smallest]];
    i = smallest;
  }
}
