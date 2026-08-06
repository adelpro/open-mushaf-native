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

import { DENSE_CANDIDATE_POOL, DENSE_TOP_K } from '@/constants/aiSearch';
import { debug } from '@/utils/isDEBUG';
import { isWeb } from '@/utils/isWeb';

import { cosineSearch } from './cosineSearch';
import { logEvent } from './debugLog';
import { getCachedModelPath } from './loadEmbedderModel';
import { loadVectorIndex } from './loadVectorIndex';
import type { DenseEmbedder, DensePathFailure } from './types';

/** Default precision when the caller does not provide one (matches current constants). */
export const DEFAULT_PRECISION = 0.5;

/**
 * Map a user-facing precision (0..1) onto the dense search knobs:
 *   - minScore   (cosine floor) — higher precision = stricter match
 *   - percentile (fraction of the corpus kept) — higher precision = fewer verses
 *
 * Range: at 0 (broad) we keep ~5% of the corpus with a near-noise floor;
 * at 1 (precise) we keep ~0.5% with a strict floor. 0.5 matches the app's
 * previous fixed behavior (~0.12 floor / ~2% percentile).
 */
export function getDensePrecisionParams(precision: number): {
  minScore: number;
  percentile: number;
} {
  const clamped = Math.min(1, Math.max(0, precision));
  const minScore = 0.05 + clamped * (0.2 - 0.05);
  const percentile = Number((0.05 - clamped * (0.05 - 0.005)).toFixed(4));
  return { minScore, percentile };
}

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
  precision: number = DEFAULT_PRECISION,
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
  // On web the model is streamed by transformers.js (never written to disk),
  // so there is no cache path to check — skip this guard.
  if (!isWeb) {
    const cached = getCachedModelPath();
    if (!cached) {
      return { available: false, rankings: new Map(), failure: 'no-cache' };
    }
  }

  try {
    const index = await loadVectorIndex();
    const queryVec = await embedder.embed(query);
    const { minScore, percentile } = getDensePrecisionParams(precision);
    const matches = cosineSearch(
      queryVec,
      index,
      DENSE_CANDIDATE_POOL,
      minScore,
    );

    const metaById = new Map(
      (index.meta as { gid: number; text_clean: string }[]).map((m) => [
        m.gid,
        m,
      ]),
    );
    if (debug) {
      const rawBest = cosineSearch(queryVec, index, 5, -1);
      logEvent('info', 'dense DIAG raw top scores (ignore threshold)', {
        query,
        queryVecLen: queryVec.length,
        first: rawBest.map((m) => ({
          gid: m.gid,
          raw: Number(m.score.toFixed(4)),
          text: metaById.get(m.gid)?.text_clean?.slice(0, 40),
        })),
      });
    }

    // Percentile top-K: keep `percentile` of the corpus (broad ≈ 5% ≈ 312
    // verses, precise ≈ 0.5% ≈ 31) instead of relying on an absolute cosine
    // floor, which the model's score range (~0.25-0.41 for short Arabic
    // queries) would violate.
    const percentileTopK = Math.max(
      1,
      Math.min(DENSE_TOP_K, Math.round(index.count * percentile)),
    );
    const top = matches.slice(0, percentileTopK);
    logEvent('info', 'dense path results', {
      query,
      matches: matches.length,
      kept: top.length,
      top10: top.slice(0, 10).map((m) => ({
        gid: m.gid,
        rank: m.rank,
        score: Number(m.score.toFixed(4)),
      })),
    });

    const rankings = new Map<number, number>();
    // Take only the top dense results into RRF — DENSE_TOP_K caps the contribution.
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
