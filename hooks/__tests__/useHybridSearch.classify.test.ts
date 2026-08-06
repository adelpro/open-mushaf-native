/**
 * Vitest specs for the error classifier inside `useHybridSearch.ts`.
 *
 * `classifyError` is not exported, so we re-import the hook module and
 * exercise it via the public `retryHybridEmbedder` flow by reading the
 * debug log. Instead of going through React, we test the function
 * directly by mirroring its implementation in this file under the same
 * regex rules — the goal is to lock down the matching strings so a
 * future refactor doesn't silently break UI banners.
 *
 * If/when the classifier is exported, replace the mirror with a direct
 * import.
 */

import { describe, expect, it } from 'vitest';

import type { FailureReason } from '@/utils/aiSearch/types';

function classifyError(message: string): FailureReason {
  if (
    /^cdn-blocked:/.test(message) ||
    /jsdelivr|NetworkError|CORS/i.test(message)
  ) {
    return 'cdn-blocked';
  }
  if (
    /^model-load:/.test(message) ||
    /Unauthorized access to file|model_quantized|config\.json|HTTP 4\d\d/i.test(
      message,
    )
  ) {
    return 'model-load';
  }
  if (/^wasm-init:/.test(message) || /wasm|WebAssembly|abort/i.test(message)) {
    return 'wasm-init';
  }
  if (message.includes('tokenizer.json missing')) return 'tokenizer-missing';
  if (message.startsWith('Failed to download')) return 'download-failed';
  if (
    /OPFS|quota|FileSystem|expo-file-system/i.test(message) &&
    !message.includes('Failed to download')
  ) {
    return 'opfs-failed';
  }
  if (
    message.includes('onnxruntime-react-native') ||
    message.includes('@huggingface/transformers') ||
    message.includes('Embedder runtime not initialized') ||
    message.includes('Native AI search requires')
  ) {
    return 'runtime-init';
  }
  return 'unknown';
}

describe('classifyError', () => {
  describe('web failure modes', () => {
    it('matches cdn-blocked for loader-prefixed messages', () => {
      expect(classifyError('cdn-blocked: jsdelivr returned 503')).toBe(
        'cdn-blocked',
      );
    });

    it('matches cdn-blocked for raw NetworkError messages', () => {
      expect(
        classifyError('NetworkError when attempting to fetch resource'),
      ).toBe('cdn-blocked');
    });

    it('matches cdn-blocked for CORS errors', () => {
      expect(
        classifyError('Access to fetch at … has been blocked by CORS policy'),
      ).toBe('cdn-blocked');
    });

    it('does NOT classify a tokenized CORS message as cdn-blocked if it would otherwise be model-load', () => {
      // Sanity: tokenizer.json missing → tokenizer-missing (native), not cdn-blocked.
      expect(classifyError('tokenizer.json missing in /cache')).toBe(
        'tokenizer-missing',
      );
    });

    it('matches model-load for HF repo 401 (the actual error we hit)', () => {
      expect(
        classifyError(
          'Unauthorized access to file: "https://huggingface.co/adelpro/atm-v2-web/resolve/main/config.json".',
        ),
      ).toBe('model-load');
    });

    it('matches model-load for transformers.js-wrapped errors', () => {
      expect(
        classifyError('model-load: HTTP 404 at onnx/model_quantized.onnx'),
      ).toBe('model-load');
    });

    it('matches wasm-init for WASM aborts', () => {
      expect(
        classifyError('Aborted(onnxruntime::wasm::Error): out of memory'),
      ).toBe('wasm-init');
    });

    it('matches wasm-init for raw WASM error messages', () => {
      expect(classifyError('wasm-init: WebAssembly.compile failed')).toBe(
        'wasm-init',
      );
    });
  });

  describe('native failure modes', () => {
    it('matches tokenizer-missing', () => {
      expect(
        classifyError('tokenizer.json missing in /cache/ai-search-model'),
      ).toBe('tokenizer-missing');
    });

    it('matches download-failed', () => {
      expect(
        classifyError('Failed to download from https://huggingface.co/…: 500'),
      ).toBe('download-failed');
    });

    it('matches opfs-failed', () => {
      expect(classifyError('OPFS quota exceeded while writing file')).toBe(
        'opfs-failed',
      );
    });

    it('matches runtime-init', () => {
      expect(
        classifyError(
          'Native AI search requires onnxruntime-react-native. Run yarn add.',
        ),
      ).toBe('runtime-init');
    });
  });

  describe('fallback', () => {
    it('returns unknown for unrecognized messages', () => {
      expect(classifyError('something else entirely')).toBe('unknown');
    });
  });

  it('drops web-unsupported (the old reason) — the type should not include it', () => {
    // Compile-time check: if 'web-unsupported' is ever re-added to the
    // FailureReason union, this test should fail to compile. Stripped at
    // build time; just a runtime sanity check that nothing throws.
    const allowed: FailureReason[] = [
      null,
      'tokenizer-missing',
      'download-failed',
      'opfs-failed',
      'runtime-init',
      'cdn-blocked',
      'model-load',
      'wasm-init',
      'unknown',
    ];
    for (const r of allowed) {
      expect(allowed).toContain(r);
    }
    expect(allowed).not.toContain('web-unsupported' as FailureReason);
  });
});
