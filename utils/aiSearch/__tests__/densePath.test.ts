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

// Mock loadVectorIndex so we don't need real binary data.
vi.mock('../loadVectorIndex', () => ({
  loadVectorIndex: () =>
    Promise.resolve({
      vectors: new Int8Array(8),
      meta: [
        { gid: 1, sura_id: 1, aya_id: 1, text_uthmani: 'a', text_clean: 'a' },
      ],
      dim: 4,
      count: 1,
    }),
}));

afterEach(() => {
  getCachedModelPath.mockReset();
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
});
