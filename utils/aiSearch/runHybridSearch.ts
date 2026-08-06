/**
 * Orchestrator: hybrid keyword + dense search fused via Reciprocal Rank Fusion.
 *
 * Always runs the keyword path. Runs the dense path only when an embedder is
 * provided AND the model file is on disk. Both paths contribute to the fused
 * score; RRF handles the rest.
 *
 * Tafseer Al-Muyassar snippets are joined by `(sura_id, aya_id)` to enrich
 * the result rows. The full tafseer file is loaded once and cached at module
 * scope to avoid re-importing for every query.
 */

import type { WordMap } from 'quran-search-engine';

import { RRF_K } from '@/constants/aiSearch';
import { MorphologyAya, QuranText } from '@/types';

import { runDensePath } from './densePath';
import { runKeywordPath } from './keywordPath';
import { loadVectorIndex } from './loadVectorIndex';
import { rankFusedScores, rrf } from './rrf';
import type {
  DenseEmbedder,
  HybridResponse,
  HybridResult,
  LayerAvailability,
  VerseVectorMeta,
} from './types';

// ---------------------------------------------------------------------------
// Tafseer join — loaded once at runtime. The full file is ~3 MB; we index
// it by `sura:aya` so lookups are O(1).
//
// Imported via dynamic `import()` so Vitest (which has trouble loading the
// full 3 MB file at module-graph time) can still exercise the other paths
// of runHybridSearch without paying the parse cost.
// ---------------------------------------------------------------------------

type TafseerAya = { id: number; sura: number; aya: number; text: string };

let tafseerLoading: Promise<Map<string, string>> | null = null;

function getTafseerIndex(): Promise<Map<string, string>> {
  if (tafseerLoading) return tafseerLoading;
  tafseerLoading = (async () => {
    const mod: any = await import('@/assets/tafaseer/muyassar.json');
    const arr: TafseerAya[] = mod.default ?? mod ?? [];
    const idx = new Map<string, string>();
    for (const t of arr) {
      const clean = (t.text ?? '').replace(/<\/?p>/g, '').trim();
      if (clean) idx.set(`${t.sura}:${t.aya}`, clean);
    }
    return idx;
  })();
  return tafseerLoading;
}

// ---------------------------------------------------------------------------
// Vector meta join — loaded once. Used to resolve gid → surah/ayah text.
// ---------------------------------------------------------------------------

let metaIndex: Promise<VerseVectorMeta[]> | null = null;

async function getVectorMeta(): Promise<VerseVectorMeta[]> {
  if (!metaIndex) {
    metaIndex = (async () => {
      const index = await loadVectorIndex();
      return index.meta;
    })();
  }
  return metaIndex;
}

// ---------------------------------------------------------------------------
// Strip HTML for tafseer snippets shown in the search results.
// ---------------------------------------------------------------------------

function tafseerSnippet(text: string, maxLen = 160): string {
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen).trim() + '…';
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export type HybridSearchInput = {
  query: string;
  quranData: QuranText[];
  morphologyData: MorphologyAya[];
  wordMap: WordMap;
  embedder: DenseEmbedder | null;
};

/**
 * Run the hybrid pipeline and return ranked, Tafseer-enriched results.
 *
 * The response always contains `results` — the matrix below describes how
 * many sources each result comes from. The `availability` field tells the UI
 * which layers were active so it can show the appropriate banner.
 *
 * | keyword | dense | behavior                                          |
 * |---------|-------|---------------------------------------------------|
 * | ✓       | ✓     | Full hybrid — both paths fuse via RRF             |
 * | ✓       | ✗     | Keyword only — banner "البحث الدلالي غير جاهز"    |
 * | ✗       | ✓     | Dense only — should not happen (keyword is always on) |
 */
export async function runHybridSearch(
  input: HybridSearchInput,
): Promise<HybridResponse> {
  const { query, quranData, morphologyData, wordMap, embedder } = input;

  if (!query.trim()) {
    return {
      results: [],
      total: 0,
      availability: { keyword: true, dense: false },
      usedDense: false,
    };
  }

  const [keywordRankings, denseResult] = await Promise.all([
    Promise.resolve(
      runKeywordPath({ query, quranData, morphologyData, wordMap }),
    ),
    runDensePath(query, embedder),
  ]);

  // Carry forward the reason the dense path was skipped (if any) so the
  // hook can surface it in the banner.
  const denseFailure = denseResult.failure;

  const rankings = [keywordRankings];
  if (denseResult.available) rankings.push(denseResult.rankings);

  const fused = rrf(rankings, RRF_K);
  const ranked = rankFusedScores(fused);

  // Resolve the top-N to verse metadata + tafseer snippet.
  // Cap at top 200 to avoid loading tafseer for thousands of rows the UI
  // never shows anyway.
  const top = ranked.slice(0, 200);

  const [meta, tafseer] = await Promise.all([
    getVectorMeta(),
    denseResult.available
      ? getTafseerIndex()
      : Promise.resolve(new Map<string, string>()),
  ]);

  const metaByGid = new Map<number, VerseVectorMeta>();
  for (const m of meta) metaByGid.set(m.gid, m);

  const built: HybridResult[] = [];
  for (const r of top) {
    const m = metaByGid.get(r.gid);
    if (!m) continue;
    const tafseerText = tafseer.get(`${m.sura_id}:${m.aya_id}`) ?? '';
    built.push({
      gid: r.gid,
      sura_id: m.sura_id,
      aya_id: m.aya_id,
      text_uthmani: m.text_uthmani,
      text_clean: m.text_clean,
      score: r.score,
      rank: r.rank,
      sources: [keywordRankings.has(r.gid) ? 'keyword' : 'dense'],
      tafseer_snippet: denseResult.available ? tafseerSnippet(tafseerText) : '',
    });
  }
  const results = built;

  const availability: LayerAvailability = {
    keyword: true,
    dense: denseResult.available,
  };

  return {
    results,
    total: ranked.length,
    availability,
    usedDense: denseResult.available,
    denseFailure,
  };
}

/** Test helper: reset module caches between cases. */
export function __resetHybridCachesForTests(): void {
  tafseerLoading = null;
  metaIndex = null;
}
