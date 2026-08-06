/**
 * Upload the ATM-V2 ONNX model + tokenizer files to a HuggingFace Hub repo.
 *
 * Source files are produced by `scripts/convert_onnx.py` (Python — see
 * the script docstring for why JS can't do the safetensors→ONNX step).
 *
 * Run from the repo root:
 *
 *   yarn build:model:upload <user>/<repo>
 *
 * Requires HF_TOKEN set in the repo-root .env file (or already in the shell
 * environment). The runtime URL is configured in:
 *   constants/aiSearch.ts → ATM_V2_MODEL_BASE_URL
 */

import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// Load .env from the repo root so HF_TOKEN is available without shell exports.
// Node 20.6+ exposes util.parseEnv; we do a lightweight manual parse as fallback.
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
const OUT_DIR = join(REPO_ROOT, 'assets', 'ai-search', 'atm-v2-onnx');

const FILES: { dest: string }[] = [
  { dest: 'model.int8.onnx' },
  { dest: 'tokenizer.json' },
  { dest: 'tokenizer_config.json' },
  { dest: 'special_tokens_map.json' },
];

function parseArgs(): { upload?: string } {
  const args = process.argv.slice(2);
  const uploadIdx = args.indexOf('--upload');
  const upload = uploadIdx >= 0 ? args[uploadIdx + 1] : undefined;
  return { upload };
}

async function uploadToHub(repo: string): Promise<void> {
  console.log(`Uploading files to ${repo} via @huggingface/hub…`);
  let createRepo: any;
  let uploadFile: any;
  try {
    // @ts-ignore — @huggingface/hub is an optional dev dep
    ({ createRepo, uploadFile } = await import('@huggingface/hub'));
  } catch {
    throw new Error(
      'Upload needs @huggingface/hub. Run: yarn add -D @huggingface/hub\n' +
        'Then `huggingface-cli login` to authenticate.',
    );
  }
  const accessToken = process.env.HF_TOKEN;
  if (!accessToken) {
    throw new Error('HF_TOKEN is not set. Add it to your .env file.');
  }
  console.log(`  Using token: ${accessToken.slice(0, 8)}…`);
  const credentials = { accessToken };
  // createRepo accepts the full "namespace/repoName" string
  try {
    await createRepo({
      repo,
      type: 'model' as const,
      private: false,
      existOk: true,
      credentials,
    });
  } catch (err: any) {
    // 409 = already exists, that's fine
    if (err?.statusCode !== 409) throw err;
  }
  for (const f of FILES) {
    const localPath = join(OUT_DIR, f.dest);
    console.log(`  ↑ ${f.dest}`);
    await uploadFile({
      repo,
      credentials,
      file: {
        path: f.dest,
        content: new Blob([new Uint8Array(readFileSync(localPath))]),
      },
    });
  }
  console.log(
    `Uploaded. URL: https://huggingface.co/${repo}/resolve/main/model.int8.onnx`,
  );
}

async function main(): Promise<void> {
  const { upload } = parseArgs();

  if (!upload) {
    console.log(
      'Usage: yarn build:model:upload <user>/<repo>\n' +
        'First, run `yarn build:model` (Python) to produce the ONNX files in\n' +
        'assets/ai-search/atm-v2-onnx/, then re-run this script with the repo name.',
    );
    return;
  }

  for (const f of FILES) {
    const dest = join(OUT_DIR, f.dest);
    if (!existsSync(dest)) {
      throw new Error(
        `Missing ${dest} — run \`yarn build:model\` (Python) first.`,
      );
    }
  }

  await uploadToHub(upload);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
