/**
 * Upload the ATM-V2 ONNX model + tokenizer files to HuggingFace Hub.
 *
 * Two repo layouts are supported:
 *
 *   --target=native <user>/<repo>   (default; e.g. adelpro/atm-v2-int8-onnx)
 *     Uploads a flat directory:
 *       model.int8.onnx
 *       tokenizer.json
 *       tokenizer_config.json
 *       special_tokens_map.json
 *     Used by the React Native runtime (expo-file-system + onnxruntime-react-native).
 *
 *   --target=web <user>/<repo>      (e.g. adelpro/atm-v2-web)
 *     Uploads the transformers.js layout produced by `convert_onnx.py --emit-web-layout`:
 *       config.json
 *       onnx/model_quantized.onnx
 *       tokenizer.json
 *       tokenizer_config.json
 *       special_tokens_map.json
 *     Used by the web runtime (@huggingface/transformers via CDN).
 *
 * Source files come from `scripts/convert_onnx.py`:
 *   - native layout: assets/ai-search/atm-v2-onnx/{model.int8.onnx,tokenizer*.json,special_tokens_map.json}
 *   - web layout:    assets/ai-search/atm-v2-onnx/web/{config.json,onnx/model_quantized.onnx,tokenizer*.json,...}
 *
 * Run from the repo root:
 *
 *   yarn build:model:upload --target=native adelpro/atm-v2-int8-onnx
 *   yarn build:model:upload --target=web    adelpro/atm-v2-web
 *
 * Requires HF_TOKEN set in the repo-root .env file (or already in the shell
 * environment). Both repos must be public — transformers.js fetches with
 * no auth, and the SW caches them at runtime.
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
const NATIVE_OUT_DIR = join(REPO_ROOT, 'assets', 'ai-search', 'atm-v2-onnx');
const WEB_OUT_DIR = join(NATIVE_OUT_DIR, 'web');

type Target = 'native' | 'web';

/** Files in the native flat layout, relative to the repo root. */
const NATIVE_TARGETS: { dest: string; localPath: string }[] = [
  {
    dest: 'model.int8.onnx',
    localPath: join(NATIVE_OUT_DIR, 'model.int8.onnx'),
  },
  {
    dest: 'tokenizer.json',
    localPath: join(NATIVE_OUT_DIR, 'tokenizer.json'),
  },
  {
    dest: 'tokenizer_config.json',
    localPath: join(NATIVE_OUT_DIR, 'tokenizer_config.json'),
  },
  {
    dest: 'special_tokens_map.json',
    localPath: join(NATIVE_OUT_DIR, 'special_tokens_map.json'),
  },
];

/**
 * Files in the web transformers.js layout, relative to the repo root.
 * `dest` is the path *inside* the HF repo (note the `onnx/` subdir).
 */
const WEB_TARGETS: { dest: string; localPath: string }[] = [
  { dest: 'config.json', localPath: join(WEB_OUT_DIR, 'config.json') },
  {
    dest: 'onnx/model_quantized.onnx',
    localPath: join(WEB_OUT_DIR, 'onnx', 'model_quantized.onnx'),
  },
  {
    dest: 'tokenizer.json',
    localPath: join(WEB_OUT_DIR, 'tokenizer.json'),
  },
  {
    dest: 'tokenizer_config.json',
    localPath: join(WEB_OUT_DIR, 'tokenizer_config.json'),
  },
  {
    dest: 'special_tokens_map.json',
    localPath: join(WEB_OUT_DIR, 'special_tokens_map.json'),
  },
];

function parseArgs(): { target: Target; repo?: string } {
  const args = process.argv.slice(2);
  const targetIdx = args.indexOf('--target');
  const targetArg = targetIdx >= 0 ? args[targetIdx + 1] : undefined;
  const target: Target = targetArg === 'web' ? 'web' : 'native';
  // Repo id is the first non-flag positional.
  const repo = args.find(
    (a, i) => !a.startsWith('--') && i !== args.indexOf('--target') + 1,
  );
  return { target, repo };
}

async function uploadToHub(
  repo: string,
  targets: { dest: string; localPath: string }[],
): Promise<void> {
  console.log(
    `Uploading ${targets.length} files to ${repo} via @huggingface/hub…`,
  );
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
  for (const f of targets) {
    console.log(`  ↑ ${f.dest}`);
    await uploadFile({
      repo,
      credentials,
      file: {
        path: f.dest,
        content: new Blob([new Uint8Array(readFileSync(f.localPath))]),
      },
    });
  }
  console.log(`Uploaded. Visit https://huggingface.co/${repo} to verify.`);
}

async function main(): Promise<void> {
  const { target, repo } = parseArgs();

  if (!repo) {
    console.log(
      'Usage: yarn build:model:upload --target=<native|web> <user>/<repo>\n' +
        '\n' +
        'Native layout (default):\n' +
        '  yarn build:model:upload adelpro/atm-v2-int8-onnx\n' +
        '  yarn build:model:upload --target=native adelpro/atm-v2-int8-onnx\n' +
        '\n' +
        'Web layout (transformers.js):\n' +
        '  yarn build:model:upload --target=web adelpro/atm-v2-web\n' +
        '\n' +
        'Run `yarn build:model --emit-web-layout` first to produce the web\n' +
        'files under assets/ai-search/atm-v2-onnx/web/.',
    );
    return;
  }

  const targets = target === 'web' ? WEB_TARGETS : NATIVE_TARGETS;
  for (const f of targets) {
    if (!existsSync(f.localPath)) {
      throw new Error(
        `Missing ${f.localPath}. Run 'yarn build:model${
          target === 'web' ? ' --emit-web-layout' : ''
        }' first.`,
      );
    }
  }

  await uploadToHub(repo, targets);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
