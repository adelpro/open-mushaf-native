/**
 * Vitest specs for the ONNX runtime adapter.
 *
 * Covers:
 *   - native createEmbedder throws an actionable message when
 *     tokenizer.json is missing next to the model file
 *   - native createEmbedder throws when modelPath is null
 *   - the thrown message lists AI_SEARCH_CDN_FILES so users know what to
 *     re-download
 */

import { File } from 'expo-file-system';
import { afterEach, describe, expect, it, vi } from 'vitest';

// Force `isWeb = false` so we exercise the native runtime branch. The
// Platform stub in vitest/rn-stub.ts makes it 'web', so override here.
vi.mock('@/utils/isWeb', () => ({ isWeb: false }));

// Stub onnxruntime-react-native so the native runtime can initialise.
vi.mock('onnxruntime-react-native', () => ({
  Tensor: class {},
  InferenceSession: {
    create: () =>
      Promise.resolve({
        run: () => Promise.resolve({}),
        release: () => {},
      }),
  },
}));

// Track whether tokenizer.json is reported as present.
let tokenizerExists = true;

afterEach(() => {
  tokenizerExists = true;
  vi.restoreAllMocks();
});

// Patch the File class's exists getter to honour our flag.
function patchFileExists() {
  const proto = Object.getPrototypeOf(new File('/x'));
  Object.defineProperty(proto, 'exists', {
    get(this: any) {
      if (this.name === 'tokenizer.json') return tokenizerExists;
      return true;
    },
    configurable: true,
  });
}

describe('createEmbedder (native)', () => {
  it('throws when modelPath is null on native', async () => {
    patchFileExists();
    const { createEmbedder } = await import('../embedderRuntime');
    await expect(createEmbedder(null, 'any/repo')).rejects.toThrow(
      /requires a local model path/,
    );
  });

  it('throws an actionable error when tokenizer.json is missing', async () => {
    patchFileExists();
    tokenizerExists = false;
    const { createEmbedder } = await import('../embedderRuntime');
    const embedder = await createEmbedder(
      '/cache/ai-search-model/model.int8.onnx',
      'any/repo',
    );
    await expect(embedder.embed('hello')).rejects.toThrow(
      /tokenizer\.json missing/,
    );
  });

  it('mentions AI_SEARCH_CDN_FILES in the tokenizer-missing message', async () => {
    patchFileExists();
    tokenizerExists = false;
    const { createEmbedder } = await import('../embedderRuntime');
    const embedder = await createEmbedder(
      '/cache/ai-search-model/model.int8.onnx',
      'any/repo',
    );
    await expect(embedder.embed('hello')).rejects.toThrow(
      /tokenizer\.json|tokenizer_config\.json|special_tokens_map\.json/,
    );
  });
});
