/**
 * ONNX runtime adapter for the AI semantic search subsystem.
 *
 * The web path lives in `embedderRuntime.web.ts` (Metro resolves `.web.ts`
 * over `.ts` on web). This file is the native entry point and is dead code
 * when `isWeb` is true. Mirrored signatures keep the call site simple.
 *
 * Native path: dynamic-imports onnxruntime-react-native.
 *
 * Required install (the app code is safe to compile without it; runtime
 * throws a clear error if missing):
 *   yarn add onnxruntime-react-native            (native — may require prebuild)
 *
 * If onnxruntime-react-native proves brittle on Expo SDK 54, fall back to
 * react-native-executorch (Software Mansion) which has first-class Expo support.
 */

import { AI_SEARCH_CDN_FILES } from '@/constants/aiSearch';
import { isWeb } from '@/utils/isWeb';

import type { DenseEmbedder, DownloadProgress } from './types';

// ---------------------------------------------------------------------------
// Shared state — kept module-local so subsequent embed() calls reuse the
// loaded tokenizer / ONNX session.
// ---------------------------------------------------------------------------

interface RuntimeState {
  embed(
    modelPath: string | null,
    text: string,
    dim: number,
  ): Promise<Float32Array>;
  dispose(): void;
}

let runtime: RuntimeState | null = null;

// ---------------------------------------------------------------------------
// Native implementation (onnxruntime-react-native)
// ---------------------------------------------------------------------------

interface NativeTokenizer {
  vocab: Record<string, number>;
  clsToken: string;
  sepToken: string;
  padToken: string;
  unkToken: string;
}

async function createNativeRuntime(): Promise<RuntimeState> {
  let ort: any;
  try {
    ort = await import('onnxruntime-react-native');
  } catch {
    throw new Error(
      'Native AI search requires onnxruntime-react-native. Run `yarn add onnxruntime-react-native` and `npx expo prebuild --clean`.',
    );
  }

  let session: any = null;
  let tokenizer: NativeTokenizer | null = null;
  let loadedModelPath: string | null = null;

  async function loadTokenizer(modelDir: string): Promise<void> {
    if (tokenizer) return;
    const { File } = await import('expo-file-system');
    const tokenizerFile = new File(modelDir, 'tokenizer.json');
    if (!tokenizerFile.exists) {
      throw new Error(
        `tokenizer.json missing in ${modelDir}. ` +
          `Re-open Smart Search to retry the download, or Settings → "إعادة تعيين البحث الذكي". ` +
          `(expected files: ${AI_SEARCH_CDN_FILES.join(', ')})`,
      );
    }
    const configFile = new File(modelDir, 'tokenizer_config.json');

    const raw: any = JSON.parse(await tokenizerFile.text());
    const model = raw.model ?? {};
    tokenizer = {
      vocab: model.vocab ?? {},
      clsToken: model.cls_token ?? '[CLS]',
      sepToken: model.sep_token ?? '[SEP]',
      padToken: model.pad_token ?? '[PAD]',
      unkToken: model.unk_token ?? '[UNK]',
    };
    // tokenizer_config is referenced for downstream features; load but unused for v1.
    void configFile;
  }

  async function ensureSession(modelPath: string | null): Promise<any> {
    if (!modelPath) {
      throw new Error(
        'Native AI search requires a local model path. ' +
          'Did the CDN download succeed? Try Settings → "إعادة تعيين البحث الذكي".',
      );
    }
    if (session && loadedModelPath === modelPath) return session;
    const modelDir = modelPath.replace(/\/[^/]+$/, '');
    await loadTokenizer(modelDir);
    session = await ort.InferenceSession.create(modelPath, {
      executionProviders: ['cpu'],
      graphOptimizationLevel: 'all',
    });
    loadedModelPath = modelPath;
    return session;
  }

  function tokenize(
    text: string,
    maxLen: number,
  ): {
    inputIds: number[];
    attentionMask: number[];
  } {
    if (!tokenizer) throw new Error('Tokenizer not loaded');
    const tokens: string[] = [tokenizer.clsToken];
    const cleaned = text.toLowerCase().replace(/\s+/g, ' ').trim();
    for (const rawToken of cleaned.split(' ')) {
      if (tokens.length >= maxLen - 1) break;
      if (tokenizer.vocab[rawToken] !== undefined) {
        tokens.push(rawToken);
        continue;
      }
      // Greedy longest-match WordPiece.
      let remaining = rawToken;
      let matched = false;
      while (remaining.length > 0) {
        let i = remaining.length;
        let tokenFound: string | null = null;
        while (i > 0) {
          const candidate =
            (tokens.length === 1 && rawToken !== remaining ? '##' : '') +
            remaining.slice(0, i);
          if (tokenizer.vocab[candidate] !== undefined) {
            tokenFound = candidate;
            break;
          }
          i--;
        }
        if (tokenFound) {
          tokens.push(tokenFound);
          remaining = remaining.slice(i);
          matched = true;
        } else {
          tokens.push(tokenizer.unkToken);
          break;
        }
      }
      if (!matched) {
        // fallback already pushed UNK above
      }
    }
    tokens.push(tokenizer.sepToken);

    while (tokens.length < maxLen) tokens.push(tokenizer.padToken);

    const inputIds = tokens.map(
      (t) => tokenizer!.vocab[t] ?? tokenizer!.vocab[tokenizer!.unkToken] ?? 0,
    );
    const padId = tokenizer.vocab[tokenizer.padToken] ?? 0;
    const attentionMask = inputIds.map((id) => (id === padId ? 0 : 1));

    return { inputIds, attentionMask };
  }

  function meanPool(
    hiddenState: Float32Array,
    seqLen: number,
    dim: number,
    attentionMask: number[],
  ): Float32Array {
    const pooled = new Float32Array(dim);
    let realTokens = 0;
    for (let i = 0; i < seqLen; i++) {
      if (attentionMask[i] === 0) continue;
      realTokens++;
      const offset = i * dim;
      for (let j = 0; j < dim; j++) pooled[j] += hiddenState[offset + j];
    }
    const inv = realTokens > 0 ? 1 / realTokens : 0;
    for (let j = 0; j < dim; j++) pooled[j] *= inv;
    let norm = 0;
    for (let j = 0; j < dim; j++) norm += pooled[j] * pooled[j];
    norm = Math.sqrt(norm) || 1;
    for (let j = 0; j < dim; j++) pooled[j] /= norm;
    return pooled;
  }

  return {
    async embed(modelPath, text, dim) {
      const sess = await ensureSession(modelPath);
      const { inputIds, attentionMask } = tokenize(text, 64);
      const seqLen = inputIds.length;

      const inputIdsBig = BigInt64Array.from(inputIds.map(BigInt));
      const maskBig = BigInt64Array.from(attentionMask.map(BigInt));

      const feeds = {
        input_ids: new ort.Tensor('int64', inputIdsBig, [1, seqLen]),
        attention_mask: new ort.Tensor('int64', maskBig, [1, seqLen]),
      };

      const results = await sess.run(feeds);
      const out = Object.values(results)[0] as {
        data: Float32Array;
        dims: number[];
      };
      const data = out.data;
      const outDim = out.dims[out.dims.length - 1] ?? dim;
      const outSeq = out.dims[out.dims.length - 2] ?? seqLen;
      return meanPool(data, outSeq, outDim, attentionMask);
    },
    dispose() {
      if (session) {
        try {
          session.release?.();
        } catch {
          // ignore
        }
        session = null;
      }
      loadedModelPath = null;
      tokenizer = null;
    },
  };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Construct an embedder bound to a specific ONNX model file.
 *
 * This file is the **native** entry point. On web, Metro selects
 * `embedderRuntime.web.ts` instead, which owns the CDN loader and the
 * @huggingface/transformers pipeline factory. The signature is
 * mirrored there so the call site (`loadEmbedderModel.ts`) works
 * unchanged across platforms.
 *
 * @param modelPath  Filesystem path to the .onnx file (from loadEmbedderModel).
 *                   Ignored on web (transformers.js fetches the model).
 * @param repoId     HuggingFace repo id. Native reads the tokenizer from
 *                   the same directory; web passes it to transformers.js.
 * @param onProgress Optional download-progress callback. Forwarded to the
 *                   web runtime; ignored on native (which already streams
 *                   its own download progress through loadEmbedderModel).
 */
export async function createEmbedder(
  modelPath: string | null,
  _repoId: string,
  _onProgress?: (p: DownloadProgress) => void,
): Promise<DenseEmbedder> {
  if (!isWeb && !modelPath) {
    throw new Error(
      'Native AI search requires a local model path. ' +
        'Did the CDN download succeed? Try Settings → "إعادة تعيين البحث الذكي".',
    );
  }
  if (!runtime) {
    runtime = await createNativeRuntime();
  }

  return {
    async embed(text: string): Promise<Float32Array> {
      if (!runtime) throw new Error('Embedder runtime not initialized');
      return runtime.embed(modelPath, text, 768);
    },
    dispose() {
      if (runtime) {
        runtime.dispose();
        runtime = null;
      }
    },
  };
}
