/**
 * Vitest specs for the dense path failure classification.
 *
 * Covers:
 *   - 'no-embedder' when no embedder is provided
 *   - 'no-cache' when the model is not cached on disk
 *   - 'embed-error' when the embedder.embed call throws
 */

import { afterEach, describe, expect, it, vi } from 'vitest';

// Mock getCachedModelPath so we can control cache state per test.
const getCachedModelPath = vi.fn();
vi.mock('../loadEmbedderModel', () => ({
  getCachedModelPath: () => getCachedModelPath(),
}));

// Mock isWeb so tests can exercise both native (cache-guarded) and web
// (cache-less) behavior regardless of the test environment's Platform.OS.
const isWebMock = { isWeb: false };
vi.mock('@/utils/isWeb', () => isWebMock);

// Debug is off by default so the verbose DIAG logging stays quiet in tests.
const debugMock = { debug: false };
vi.mock('@/utils/isDEBUG', () => debugMock);

// Mock loadVectorIndex so we don't need real binary data.
const indexMock = {
  vectors: new Int8Array(8),
  meta: [{ gid: 1, sura_id: 1, aya_id: 1, text_uthmani: 'a', text_clean: 'a' }],
  dim: 4,
  count: 1,
};
vi.mock('../loadVectorIndex', () => ({
  loadVectorIndex: () => Promise.resolve(indexMock),
}));

afterEach(() => {
  getCachedModelPath.mockReset();
  isWebMock.isWeb = false;
  debugMock.debug = false;
  indexMock.vectors = new Int8Array(8);
});

describe('runDensePath failure classification', () => {
  it('returns no-embedder when embedder is null', async () => {
    const { runDensePath } = await import('../densePath');
    const res = await runDensePath('hello', null);
    expect(res.available).toBe(false);
    expect(res.failure).toBe('no-embedder');
  });

  it('returns no-cache when model is not on disk', async () => {
    getCachedModelPath.mockReturnValue(null);
    const { runDensePath } = await import('../densePath');
    const res = await runDensePath('hello', {
      async embed() {
        return new Float32Array(4);
      },
      dispose() {},
    });
    expect(res.available).toBe(false);
    expect(res.failure).toBe('no-cache');
  });

  it('runs the dense path on web even when no model is cached on disk', async () => {
    isWebMock.isWeb = true;
    getCachedModelPath.mockReturnValue(null);
    const { runDensePath } = await import('../densePath');
    const res = await runDensePath('hello', {
      async embed() {
        return new Float32Array([0.6, 0.8, 0.0, 0.0]);
      },
      dispose() {},
    });
    expect(res.available).toBe(true);
    expect(res.failure).toBeUndefined();
  });

  it('returns embed-error when the embedder throws', async () => {
    getCachedModelPath.mockReturnValue('/fake/model.int8.onnx');
    const { runDensePath } = await import('../densePath');
    const res = await runDensePath('hello', {
      async embed() {
        throw new Error('boom');
      },
      dispose() {},
    });
    expect(res.available).toBe(false);
    expect(res.failure).toBe('embed-error');
  });

  it('returns available=true when everything works', async () => {
    getCachedModelPath.mockReturnValue('/fake/model.int8.onnx');
    const { runDensePath } = await import('../densePath');
    const res = await runDensePath('hello', {
      async embed() {
        return new Float32Array([0.6, 0.8, 0.0, 0.0]);
      },
      dispose() {},
    });
    expect(res.available).toBe(true);
    expect(res.failure).toBeUndefined();
  });

  it('keeps a result whose cosine is below the old 0.45 floor but above the 0.12 noise floor', async () => {
    // One stored row aligned with the query → cosine ≈ 127/127 = 1.0.
    indexMock.vectors = new Int8Array([127, 0, 0, 0, 0, 0, 0, 0]);
    getCachedModelPath.mockReturnValue('/fake/model.int8.onnx');
    const { runDensePath } = await import('../densePath');
    const res = await runDensePath('hello', {
      async embed() {
        return new Float32Array([1.0, 0.0, 0.0, 0.0]);
      },
      dispose() {},
    });
    expect(res.available).toBe(true);
    expect(res.rankings.get(1)).toBe(1);
  });

  it('keeps a weak match at broad precision (0) but drops it at precise precision (1)', async () => {
    // Stored row [13, 0, 0, 0] vs query [1, 0, 0, 0] → cosine ≈ 13/127 ≈ 0.10.
    indexMock.vectors = new Int8Array([13, 0, 0, 0, 0, 0, 0, 0]);
    getCachedModelPath.mockReturnValue('/fake/model.int8.onnx');
    const { runDensePath } = await import('../densePath');
    const embedder = {
      async embed() {
        return new Float32Array([1.0, 0.0, 0.0, 0.0]);
      },
      dispose() {},
    };

    const broad = await runDensePath('hello', embedder, 0);
    expect(broad.available).toBe(true);
    expect(broad.rankings.get(1)).toBe(1);

    const precise = await runDensePath('hello', embedder, 1);
    expect(precise.available).toBe(true);
    expect(precise.rankings.size).toBe(0);
  });

  it('maps precision to the cosine floor and top percentile', async () => {
    const { getDensePrecisionParams } = await import('../densePath');
    expect(getDensePrecisionParams(0)).toEqual({
      minScore: 0.05,
      percentile: 0.05,
    });
    expect(getDensePrecisionParams(1)).toEqual({
      minScore: 0.2,
      percentile: 0.005,
    });
    expect(getDensePrecisionParams(0.5)).toEqual({
      minScore: 0.125,
      percentile: 0.0275,
    });
    // Out-of-range inputs clamp.
    expect(getDensePrecisionParams(-1)).toEqual(getDensePrecisionParams(0));
    expect(getDensePrecisionParams(5)).toEqual(getDensePrecisionParams(1));
  });
});
