/**
 * Prepare the transformers.js (web) layout from existing native files.
 *
 * Cheaper alternative to `python scripts/convert_onnx.py --emit-web-layout`:
 * skips the safetensors→ONNX re-export (which takes minutes) and just:
 *   1. Copies the existing `assets/ai-search/atm-v2-onnx/model.int8.onnx`
 *      into `web/onnx/model_quantized.onnx`.
 *   2. Copies the existing tokenizer files into `web/`.
 *   3. Downloads `config.json` from the base sentence-transformers repo
 *      (`Omartificial-Intelligence-Space/Arabic-Triplet-Matryoshka-V2`).
 *      transformers.js's pipeline() needs this to identify the model
 *      architecture.
 *   4. If the base repo ships `1_Pooling/config.json`, merges
 *      `pooling_mode_mean_tokens: true` into the root `config.json` so
 *      transformers.js applies the right pooling (it does NOT auto-discover
 *      the `1_Pooling/` subdir).
 *
 * Run from the repo root:
 *
 *   yarn prepare:web-layout
 *
 * Then upload with:
 *
 *   yarn build:model:upload:web adelpro/atm-v2-web
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// Load .env from the repo root so HF_TOKEN is available (used only for
// auth'd hf_hub_download calls; not required for a public repo).
function loadDotEnv(): void {
  const envPath = join(
    resolve(dirname(fileURLToPath(import.meta.url)), '..'),
    '.env',
  );
  if (!existsSync(envPath)) return;
  const lines = readFileSync(envPath, 'utf-8').split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx < 1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed
      .slice(eqIdx + 1)
      .trim()
      .replace(/^["']|["']$/g, '');
    if (!(key in process.env) || key === 'HF_TOKEN') process.env[key] = val;
  }
}
loadDotEnv();

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(SCRIPT_DIR, '..');
const NATIVE_DIR = join(REPO_ROOT, 'assets', 'ai-search', 'atm-v2-onnx');
const WEB_DIR = join(NATIVE_DIR, 'web');
const WEB_ONNX_DIR = join(WEB_DIR, 'onnx');

const BASE_REPO =
  'Omartificial-Intelligence-Space/Arabic-Triplet-Matryoshka-V2';

interface HfFile {
  path: string;
  size: number;
}

async function hfDownload(repoId: string, filename: string): Promise<Buffer> {
  const { hfApi, hfHubDownload } = await import(
    '@huggingface/hub' as string
  ).catch(() => {
    throw new Error(
      'Download needs @huggingface/hub. Run: yarn add -D @huggingface/hub',
    );
  });
  // Prefer hfHubDownload (uses @huggingface/hub's resolver). Falls back to
  // hfApi.listRepoFiles + raw fetch if the typed helper is not exported.
  if (typeof hfHubDownload === 'function') {
    const blob = await hfHubDownload({
      repo: repoId,
      filename,
    });
    return Buffer.from(await blob.arrayBuffer());
  }
  // Fallback: raw fetch with redirect following. Works without auth for
  // public repos.
  const url = `https://huggingface.co/${repoId}/resolve/main/${filename}`;
  const headers: Record<string, string> = {};
  if (process.env.HF_TOKEN) {
    headers.Authorization = `Bearer ${process.env.HF_TOKEN}`;
  }
  const res = await fetch(url, { redirect: 'follow', headers });
  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`);
  }
  const ab = await res.arrayBuffer();
  return Buffer.from(ab);
}

async function main(): Promise<void> {
  // 1. Verify native source files exist.
  const required = [
    'model.int8.onnx',
    'tokenizer.json',
    'tokenizer_config.json',
    'special_tokens_map.json',
  ];
  for (const name of required) {
    const p = join(NATIVE_DIR, name);
    if (!existsSync(p)) {
      throw new Error(
        `Missing native source file: ${p}\n` +
          'Run `yarn build:model` (Python) first to produce it, OR ' +
          'restore it from the existing native HF repo.',
      );
    }
  }

  // 2. Make web/ and web/onnx/ directories.
  mkdirSync(WEB_ONNX_DIR, { recursive: true });

  // 3. Copy native → web layout.
  const int8Size = readFileSync(join(NATIVE_DIR, 'model.int8.onnx')).length;
  const quantizedDest = join(WEB_ONNX_DIR, 'model_quantized.onnx');
  // Avoid re-copy if up-to-date (saves 135 MB of disk I/O on repeat runs).
  if (
    !existsSync(quantizedDest) ||
    readFileSync(quantizedDest).length !== int8Size
  ) {
    console.log(
      `  → onnx/model_quantized.onnx (${(int8Size / 1e6).toFixed(2)} MB)`,
    );
    writeFileSync(
      quantizedDest,
      readFileSync(join(NATIVE_DIR, 'model.int8.onnx')),
    );
  } else {
    console.log('  ✓ onnx/model_quantized.onnx up-to-date');
  }
  for (const name of [
    'tokenizer.json',
    'tokenizer_config.json',
    'special_tokens_map.json',
  ]) {
    const src = join(NATIVE_DIR, name);
    const dst = join(WEB_DIR, name);
    writeFileSync(dst, readFileSync(src));
    console.log(`  → ${name}`);
  }

  // 4. Download config.json from the base repo.
  const configDest = join(WEB_DIR, 'config.json');
  if (!existsSync(configDest)) {
    console.log(`  ↓ config.json (from ${BASE_REPO})`);
    const buf = await hfDownload(BASE_REPO, 'config.json');
    writeFileSync(configDest, buf);
  } else {
    console.log('  ✓ config.json already present');
  }

  // 5. Merge 1_Pooling/config.json if present.
  try {
    const poolingBuf = await hfDownload(BASE_REPO, '1_Pooling/config.json');
    const cfg = JSON.parse(readFileSync(configDest, 'utf-8'));
    const pooling = JSON.parse(poolingBuf.toString('utf-8'));
    if (cfg.pooling_mode_mean_tokens === undefined) {
      cfg.pooling_mode_mean_tokens = pooling.pooling_mode_mean_tokens ?? true;
      writeFileSync(configDest, JSON.stringify(cfg, null, 2));
      console.log('  → merged 1_Pooling/config.json → pool=mean');
    } else {
      console.log('  ✓ config.json already has pooling_mode_mean_tokens');
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.log(`  (no 1_Pooling/config.json — ${msg})`);
  }

  console.log();
  console.log(`Web layout ready at: ${WEB_DIR}`);
  console.log('Next: yarn build:model:upload:web adelpro/atm-v2-web');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
