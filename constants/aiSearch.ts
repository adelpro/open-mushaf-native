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
 * HuggingFace repo id (used by the web runtime to load via
 * @huggingface/transformers). This is the official Apache-2.0 release;
 * no Xenova pre-quantized port exists for this model, so the runtime
 * downloads the safetensors and converts to ONNX in WASM on first use.
 */
export const ATM_V2_REPO_ID =
  'Omartificial-Intelligence-Space/Arabic-Triplet-Matryoshka-V2';

/** Tokenizer files downloaded alongside the model. */
export const AI_SEARCH_CDN_FILES = [
  ATM_V2_MODEL_FILENAME,
  'tokenizer.json',
  'tokenizer_config.json',
  'special_tokens_map.json',
] as const;

/** Embedding dimension. Must match the build script (768 = full Matryoshka dim). */
export const EMBEDDING_DIM = 768;

/** Number of top dense results to keep before RRF. Larger = better recall, slower. */
export const DENSE_TOP_K = 200;

/** Constant for RRF score: score(d) = Σ 1 / (k + rank). 60 is the standard value. */
export const RRF_K = 60;

/**
 * Cosine similarity floor. Results below this are discarded to suppress noise.
 * For L2-normalized vectors the score is in [-1, 1]; 0.45 catches the
 * meaningful matches without flooding the UI with weak signals.
 */
export const MIN_COSINE_SCORE = 0.45;

/** Number of verses the dense path considers before applying MIN_COSINE_SCORE. */
export const DENSE_CANDIDATE_POOL = 600;
