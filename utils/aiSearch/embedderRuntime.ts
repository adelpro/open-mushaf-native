/**
 * ONNX runtime adapter for the AI semantic search subsystem.
 *
 * Single file with internal platform branching — avoids the Metro `.web.ts` /
 * `.native.ts` module-resolution dance and keeps the surface area small.
 *
 *   Web path:    dynamic-imports @huggingface/transformers (pure JS ONNX).
 *   Native path: dynamic-imports onnxruntime-react-native.
 *
 * Both expose `embed(text) → Float32Array` returning a L2-normalized vector
 * in the same space as the bundled int8 verse index.
 *
 * Required installs (the app code is safe to compile without them; runtime
 * throws a clear error if missing):
 *   yarn add @huggingface/transformers           (web)
 *   yarn add onnxruntime-react-native            (native — may require prebuild)
 *
 * If onnxruntime-react-native proves brittle on Expo SDK 54, fall back to
 * react-native-executorch (Software Mansion) which has first-class Expo support.
 */

import { isWeb } from '@/utils/isWeb';

import type { DenseEmbedder } from './types';

// ---------------------------------------------------------------------------
// Shared state — kept module-local so subsequent embed() calls reuse the
// loaded tokenizer / ONNX session.
// ---------------------------------------------------------------------------

interface RuntimeState {
  embed(modelPath: string, text: string, dim: number): Promise<Float32Array>;
  dispose(): void;
}

let runtime: RuntimeState | null = null;

// ---------------------------------------------------------------------------
// Web implementation (@huggingface/transformers)
// ---------------------------------------------------------------------------

async function createWebRuntime(repoId: string): Promise<RuntimeState> {
  let transformers: any;
  try {
    transformers = await import('@huggingface/transformers');
  } catch {
    throw new Error(
      'Web AI search requires @huggingface/transformers. Run `yarn add @huggingface/transformers`.',
    );
  }

  // Prefer WASM proxy off (faster cold start for large models).
  if (transformers.env?.backends?.onnx?.wasm) {
    transformers.env.backends.onnx.wasm.proxy = false;
  }

  let pipeline: any = null;

  async function ensurePipeline(): Promise<any> {
    if (pipeline) return pipeline;
    pipeline = await transformers.pipeline('feature-extraction', repoId, {
      quantized: true,
    });
    return pipeline;
  }

  return {
    async embed(_modelPath, text, dim) {
      const p = await ensurePipeline();
      const out = await p(text, { pooling: 'none', normalize: false });
      const data: Float32Array = out.data;
      const seqLen: number = out.dims[out.dims.length - 2];
      const outDim: number = out.dims[out.dims.length - 1];
      const actualDim = outDim ?? dim;

      // Mean-pool across the sequence dimension.
      const pooled = new Float32Array(actualDim);
      for (let i = 0; i < seqLen; i++) {
        const offset = i * actualDim;
        for (let j = 0; j < actualDim; j++) {
          pooled[j] += data[offset + j];
        }
      }
      const inv = 1 / seqLen;
      for (let j = 0; j < actualDim; j++) pooled[j] *= inv;

      // L2-normalize.
      let norm = 0;
      for (let j = 0; j < actualDim; j++) norm += pooled[j] * pooled[j];
      norm = Math.sqrt(norm) || 1;
      for (let j = 0; j < actualDim; j++) pooled[j] /= norm;

      return pooled;
    },
    dispose() {
      pipeline = null;
    },
  };
}

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
      throw new Error(`tokenizer.json missing in ${modelDir}`);
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

  async function ensureSession(modelPath: string): Promise<any> {
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
 * @param modelPath  Filesystem path to the .onnx file (from loadEmbedderModel).
 * @param repoId     HuggingFace repo id (used by the web runtime to load via
 *                   @huggingface/transformers; the native runtime ignores it
 *                   and reads the tokenizer from the same directory).
 */
export async function createEmbedder(
  modelPath: string,
  repoId: string,
): Promise<DenseEmbedder> {
  if (!runtime) {
    runtime = isWeb
      ? await createWebRuntime(repoId)
      : await createNativeRuntime();
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
