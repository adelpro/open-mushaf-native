/**
 * Build the Quran vector database.
 *
 * Encodes the 6,236 verses (each prefixed with its Tafseer Al-Muyassar) into
 * a quantized int8 vector index that the app loads at AI-search time.
 *
 * Run from the repo root:
 *
 *   yarn build:vectors
 *
 * Outputs (committed to assets/ai-search/):
 *   quran_vectors.bin       raw int8 little-endian, shape 6236 × 768
 *   quran_vectors_meta.json  6236 verse records (gid, sura_id, aya_id, text)
 *
 * Uses Omartificial-Intelligence-Space/Arabic-Triplet-Matryoshka-V2
 * (Apache-2.0). The runtime uses the same model id; @huggingface/transformers
 * downloads the safetensors and (on web) converts to ONNX in WASM.
 *
 * First run downloads the model to .model-cache/ (~540 MB safetensors).
 * Subsequent runs reuse the cache.
 */

import { execSync } from 'node:child_process';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(SCRIPT_DIR, '..');
const PYTHON_SCRIPT = join(REPO_ROOT, 'scripts', 'build_vectors.py');

console.log(
  'Running Python vector generation pipeline (scripts/build_vectors.py)…\n',
);

try {
  execSync(`python "${PYTHON_SCRIPT}"`, {
    cwd: REPO_ROOT,
    stdio: 'inherit',
  });
} catch {
  console.error(
    '\nVector generation failed. Ensure Python 3 with transformers + torch is installed.',
  );
  process.exit(1);
}
