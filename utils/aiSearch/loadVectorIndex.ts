/**
 * Lazy loader for the bundled Quran vector index.
 *
 * The 4.7 MB Int8 vector buffer and ~5 MB metadata JSON live under
 * assets/ai-search/. They are bundled into the app and parsed on first call.
 *
 * The empty placeholders in this directory are committed (so Metro + TS
 * resolve the imports in a fresh checkout) and overwritten by the Python
 * build script — see scripts/build_quran_vectordb.py.
 */

import vectorBinUrl from '@/assets/ai-search/quran_vectors.bin';
import vectorMeta from '@/assets/ai-search/quran_vectors_meta.json';

import type { VectorIndex, VerseVectorMeta } from './types';

let cachedIndex: Promise<VectorIndex> | null = null;

const EMBEDDING_DIM = 768; // full Matryoshka dim — matches the build script.

/**
 * Load (or return cached) vector index.
 *
 * Rejects only on hard failures (missing file, parse error). All other
 * consumers should treat the returned Promise as a singleton.
 */
export function loadVectorIndex(): Promise<VectorIndex> {
  if (cachedIndex) return cachedIndex;

  cachedIndex = (async () => {
    const meta = (vectorMeta as unknown as VerseVectorMeta[]) ?? [];
    const url: string | number = vectorBinUrl as string | number;
    const fetchUrl = typeof url === 'number' ? String(url) : (url as string);

    const res = await fetch(fetchUrl);
    if (!res.ok) {
      throw new Error(
        `Failed to fetch quran_vectors.bin (${res.status} ${res.statusText})`,
      );
    }
    const buf = await res.arrayBuffer();
    const vectors = new Int8Array(buf);
    const count = meta.length;
    if (count === 0) {
      throw new Error(
        'Vector index empty — run scripts/build_quran_vectordb.py to generate assets/ai-search/quran_vectors_meta.json.',
      );
    }
    if (vectors.length !== count * EMBEDDING_DIM) {
      throw new Error(
        `Vector index size mismatch: buffer=${vectors.length} bytes, expected ${count * EMBEDDING_DIM} (${count} verses × ${EMBEDDING_DIM} dims). Re-run scripts/build_quran_vectordb.py.`,
      );
    }
    return { vectors, meta, dim: EMBEDDING_DIM, count };
  })().catch((err) => {
    cachedIndex = null;
    throw err;
  });

  return cachedIndex;
}

/** Test helper: clear the memoized index (never call from app code). */
export function __resetVectorIndexCacheForTests(): void {
  cachedIndex = null;
}

/**
 * Extract the int8 row for a given gid (1-based).
 * Pure helper — no allocation. Caller owns the returned view's lifetime.
 */
export function getRowForGid(index: VectorIndex, gid: number): Int8Array {
  const start = (gid - 1) * index.dim;
  return index.vectors.subarray(start, start + index.dim);
}
