/**
 * Constants for the AI semantic search subsystem.
 *
 * The pipeline uses one Apache-2.0 embedding model:
 * Omartificial-Intelligence-Space/Arabic-Triplet-Matryoshka-V2.
 * Its CDN endpoints + tokenizer files are configured here.
 *
 * EMBEDDING_DIM must match scripts/build_quran_vectordb.py and
 * scripts/quantize_atm_v2.py. Re-run both if you ever change this constant.
 */

/**
 * Base URL for the hosted model + tokenizer files. Resolves to:
 *   https://huggingface.co/<user>/atm-v2-int8-onnx/resolve/main/<file>
 *
 * Default points at adelpro's CDN; override via the EXPO_PUBLIC_AI_SEARCH_MODEL_URL
 * environment variable for forks or private deployments.
 */
export const ATM_V2_MODEL_BASE_URL =
  process.env.EXPO_PUBLIC_AI_SEARCH_MODEL_URL ||
  'https://huggingface.co/adelpro/atm-v2-int8-onnx/resolve/main/';

/** Filename inside the CDN directory. Must match `scripts/quantize_atm_v2.py`. */
export const ATM_V2_MODEL_FILENAME = 'model.int8.onnx';

/**
 * HuggingFace repo id used by the **native** embedder's tokenizer download.
 * The native runtime uses `ATM_V2_MODEL_BASE_URL` to fetch the flat file layout
 * (one ONNX blob + tokenizer files in a flat directory). The on-device file
 * path is what `utils/aiSearch/loadEmbedderModel.ts` returns.
 */
export const ATM_V2_REPO_ID =
  'Omartificial-Intelligence-Space/Arabic-Triplet-Matryoshka-V2';

/**
 * HuggingFace repo id used by the **web** runtime via @huggingface/transformers.
 * This repo is laid out for transformers.js:
 *   config.json
 *   tokenizer.json
 *   tokenizer_config.json
 *   special_tokens_map.json
 *   onnx/model_quantized.onnx
 *
 * The `dtype: 'q8'` pipeline option resolves to `onnx/model_quantized.onnx`
 * (`transformers.js` maps `q8` → `_quantized` suffix and looks in `onnx/`).
 * transformers.js fetches over plain HTTPS with no auth, so the repo must be
 * public.
 */
export const ATM_V2_WEB_REPO_ID = 'adelpro/atm-v2-web';

/**
 * URL of the runtime loader script that imports @huggingface/transformers
 * from a CDN. Served from `public/ai/transformers-loader.js` (copied to
 * `dist/ai/` by `yarn web:export`) so Metro never processes it.
 */
export const AI_SEARCH_LOADER_PATH = '/ai/transformers-loader.js';

/**
 * CDN URL the loader script imports. jsDelivr +esm serves a Rollup-bundled
 * ESM build of `transformers.web.js` with `access-control-allow-origin: *`,
 * which works from any origin. Override via `EXPO_PUBLIC_AI_SEARCH_WEB_CDN`.
 */
export const AI_SEARCH_WEB_CDN_URL =
  process.env.EXPO_PUBLIC_AI_SEARCH_WEB_CDN ||
  'https://cdn.jsdelivr.net/npm/@huggingface/transformers@4.2.0/+esm';

/** Tokenizer files downloaded alongside the model. */
export const AI_SEARCH_CDN_FILES = [
  ATM_V2_MODEL_FILENAME,
  'tokenizer.json',
  'tokenizer_config.json',
  'special_tokens_map.json',
] as const;

/** Embedding dimension. Must match the build script (768 = full Matryoshka dim). */
export const EMBEDDING_DIM = 768;

/** Hard cap on dense results fed into RRF. Never exceeded. */
export const DENSE_TOP_K = 200;

/**
 * Fraction of the corpus the dense path keeps (percentile top-K). With 6,236
 * verses, 2% ≈ 125 results. Chosen over an absolute cosine floor because the
 * model scores short Arabic name queries around 0.25-0.41 — an absolute
 * floor like 0.45 silently drops every match.
 */
export const DENSE_TOP_PERCENTILE = 0.02;

/** Constant for RRF score: score(d) = Σ 1 / (k + rank). 60 is the standard value. */
export const RRF_K = 60;

/**
 * Noise floor. Scores below this are discarded to suppress random similarity
 * for unrelated queries. For 768-dim L2-normalized vectors, random cosine
 * similarity clusters near 0 with σ ≈ 1/√768 ≈ 0.036, so 0.12 is ~3σ above
 * noise while real matches (≥ ~0.25) are always kept.
 */
export const MIN_COSINE_SCORE = 0.12;

/** Number of verses the dense path considers before applying MIN_COSINE_SCORE. */
export const DENSE_CANDIDATE_POOL = 600;
