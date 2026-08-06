/**
 * Reciprocal Rank Fusion (Cormack et al. 2009).
 *
 * For each candidate document, score = Σ 1 / (k + rank_i) summed over all
 * ranking lists. A document that appears high in multiple lists dominates;
 * a document that appears in only one list still gets credit but ranks lower.
 *
 * Constant k = 60 is the standard default from the paper and works well for
 * small corpora without tuning.
 */

/**
 * Fuse multiple ranking maps into a single map of fused scores.
 *
 * @param rankings  Array of `gid → rank` maps (rank is 1-based). Empty ranks
 *                  for a missing gid are treated as `Infinity` (no contribution).
 * @param k         RRF constant. Defaults to 60 (Cormack et al. 2009).
 */
export function rrf(
  rankings: readonly ReadonlyMap<number, number>[],
  k: number = 60,
): Map<number, number> {
  const scores = new Map<number, number>();
  for (const ranking of rankings) {
    if (ranking.size === 0) continue;
    for (const [gid, rank] of ranking) {
      const contribution = 1 / (k + rank);
      scores.set(gid, (scores.get(gid) ?? 0) + contribution);
    }
  }
  return scores;
}

/**
 * Convert a fused score map to a ranked array (descending score, 1-based rank).
 */
export function rankFusedScores(
  scores: ReadonlyMap<number, number>,
): { gid: number; score: number; rank: number }[] {
  const entries = Array.from(scores, ([gid, score]) => ({
    gid,
    score,
    rank: 0,
  }));
  entries.sort((a, b) => b.score - a.score);
  return entries.map((e, i) => ({ ...e, rank: i + 1 }));
}
