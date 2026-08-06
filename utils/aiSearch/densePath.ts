/**
 * Dense path of the hybrid search pipeline.
 *
 * Loads the bundled vector index (lazily + memoized) and embeds the query
 * with the ATM-V2 ONNX model. Returns a gid → rank map for RRF.
 *
 * Skipped entirely if the model is not ready — caller surfaces this via the
 * `availability.dense` flag on the response, and the specific cause via the
 * `failure` field.
 */

import {
  DENSE_CANDIDATE_POOL,
  DENSE_TOP_K,
  MIN_COSINE_SCORE,
} from '@/constants/aiSearch';

import { cosineSearch } from './cosineSearch';
import { getCachedModelPath } from './loadEmbedderModel';
import { loadVectorIndex } from './loadVectorIndex';
import type { DenseEmbedder, DensePathFailure } from './types';

/** Result of the dense path. `available: false` means the model wasn't ready. */
export type DensePathResult = {
  available: boolean;
  rankings: Map<number, number>;
  /** Present when `available` is false — explains why. */
  failure?: DensePathFailure;
};

export async function runDensePath(
  query: string,
  embedder: DenseEmbedder | null,
): Promise<DensePathResult> {
  if (!embedder || !query.trim()) {
    return {
      available: false,
      rankings: new Map(),
      failure: embedder ? undefined : 'no-embedder',
    };
  }
  // Fail fast if no model file is cached locally — the caller should have
  // caught this earlier via getCachedModelPath(), but we double-check.
  const cached = getCachedModelPath();
  if (!cached) {
    return { available: false, rankings: new Map(), failure: 'no-cache' };
  }

  try {
    const index = await loadVectorIndex();
    const queryVec = await embedder.embed(query);
    const matches = cosineSearch(
      queryVec,
      index,
      DENSE_CANDIDATE_POOL,
      MIN_COSINE_SCORE,
    );

    const rankings = new Map<number, number>();
    // Take only the top dense results into RRF — DENSE_TOP_K caps the contribution.
    const top = matches.slice(0, DENSE_TOP_K);
    for (const m of top) {
      rankings.set(m.gid, m.rank);
    }
    return { available: true, rankings };
  } catch (err) {
    const reason =
      err instanceof Error && /vector/i.test(err.message)
        ? 'vector-load-error'
        : 'embed-error';
    return { available: false, rankings: new Map(), failure: reason };
  }
}
