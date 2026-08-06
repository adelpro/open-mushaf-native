# assets/ai-search/

Vector index + AI-search assets used by the `بالذكاء الاصطناعي` tab in `/search`.

## Files (committed)

| File | Size | Purpose |
|---|---|---|
| `quran_vectors.bin` | ~4.7 MB | Raw int8 little-endian, shape `6236 × 768`. One row per Quran verse, sorted by `gid` ascending. |
| `quran_vectors_meta.json` | ~2.5 MB | Verse metadata keyed by index position. |
| `atm-v2-onnx/` | ~810 MB | Local copy of the ONNX model + tokenizer. **Committed** (offline-first), but you never need to touch these files unless you are re-exporting a model. |
| `README.md` | this file | Documentation. |

The `atm-v2-onnx/` subdirectory contains three layouts:

```
atm-v2-onnx/
├── model.fp32.onnx            # fp32 export (keep as a source artifact)
├── model.int8.onnx            # native runtime model  (~135 MB)
├── tokenizer.json
├── tokenizer_config.json
├── special_tokens_map.json
├── vocab.txt
└── web/                       # transformers.js layout (uploaded to adelpro/atm-v2-web)
    ├── config.json
    ├── tokenizer*.json
    └── onnx/model_quantized.onnx
```

---

## How the end user experiences AI search (runtime flow)

The `بالذكاء الاصطناعي` tab runs **hybrid search**: a keyword pass
(`quran-search-engine`, always available, bundled) fused with a dense/semantic
pass (embedding model) via RRF. The dense pass needs two things:

1. the **vector index** — `quran_vectors.bin` + `quran_vectors_meta.json`,
   already bundled in the app (~7 MB), and
2. the **embedding model** — ~135 MB INT8 ONNX, **not** bundled. It is
   downloaded at runtime on first use and then reused. The flow differs by
   platform:

### Native (Android / iOS)

1. **First use** — the user opens `/search`, switches to the AI tab, and types
   a query. `useHybridSearch` → `loadEmbedderModel()` streams the 4 files
   (`model.int8.onnx`, `tokenizer.json`, `tokenizer_config.json`,
   `special_tokens_map.json`) from `ATM_V2_MODEL_BASE_URL`
   (`https://huggingface.co/adelpro/atm-v2-int8-onnx/resolve/main/`). A blue
   banner shows live MB progress.
2. Files are written to the app cache dir `.../ai-search-model/`. The absolute
   URI of the model file is persisted in an MMKV store
   (`new MMKV({ id: 'ai-search' })`, key `modelPath`).
3. **Reuse** — on every later launch, `loadEmbedderModel()` reads the persisted
   path, verifies all 4 files still exist, and if so **skips the download
   entirely**. The `onnxruntime-react-native` session is created from the local
   file, so search works fully **offline** after the first use. The session is
   held in a module-level cache across queries and screen unmounts.
4. If any file is missing or stale, the path is cleared and the download
   restarts automatically. The user can force a fresh download via
   Settings → "إعادة تعيين البحث الذكي" (`clearCachedModel()`), or tap
   "إعادة المحاولة" in the error banner (`retryHybridEmbedder()`).

### Web (PWA)

1. **First use** — `loadEmbedderModel()` short-circuits: no local download.
   `embedderRuntime.web.ts` injects `public/ai/transformers-loader.js`, which
   dynamically imports `@huggingface/transformers` from jsDelivr, then calls
   `pipeline('feature-extraction', ATM_V2_WEB_REPO_ID, { dtype: 'q8', device: 'wasm' })`.
2. `@huggingface/transformers` fetches the transformers.js layout
   (`config.json`, `tokenizer.json`, `tokenizer_config.json`,
   `special_tokens_map.json`, `onnx/model_quantized.onnx`) from
   `https://huggingface.co/adelpro/atm-v2-web` and caches it in browser
   **Cache Storage** under the key `transformers-cache`.
3. **Reuse** — the Cache Storage entry persists across sessions, so subsequent
   visits hit the cache with no network fetch. Within a session the module is
   kept alive on `globalThis.__transformers`.
4. "إعادة تعيين البحث الذكي" deletes the `transformers-cache` entry, drops the
   in-memory module reference, and forces a re-download on the next use.

**Why the platforms differ?** Native streams the model to disk so it can be fed
to `onnxruntime-react-native` offline. On web there is no native runtime —
transformers.js WASM runs in the browser, so the model lives in the browser's
own cache instead.

---

## Package.json scripts

| Script | Command | What it does |
|---|---|---|
| `yarn build:vectors` | `tsx scripts/build-vectors.ts` → `python scripts/build_vectors.py` | Encodes all 6,236 verses and emits `quran_vectors.bin` + `quran_vectors_meta.json`. Needs Python 3 + `transformers` + `torch`. |
| `yarn build:model` | `python scripts/convert_onnx.py` | safetensors → fp32 → INT8 ONNX + tokenizer → `assets/ai-search/atm-v2-onnx/` (native layout). **Only needed if you re-export the model.** |
| `yarn build:model:web` | `python scripts/convert_onnx.py --emit-web-layout` | Same as above plus `web/` layout (`config.json` + `onnx/model_quantized.onnx`). |
| `yarn prepare:web-layout` | `tsx scripts/prepare-web-layout.ts` | Cheaper than `build:model:web`: copies the existing native ONNX to `web/onnx/model_quantized.onnx`, merges `1_Pooling` pooling config, no re-export. |
| `yarn build:model:upload <user>/<repo>` | `tsx scripts/build-model.ts --target=native <user>/<repo>` | Uploads the 4 native files to HF Hub. Needs `HF_TOKEN` in `.env`. |
| `yarn build:model:upload:web <user>/<repo>` | `tsx scripts/build-model.ts --target=web <user>/<repo>` | Uploads the transformers.js layout to HF Hub. |
| `yarn build:ai` | `yarn build:vectors` | Vectors only (the commonly-needed step). |
| `yarn build:ai:full` | vectors + model + native upload + `prepare:web-layout` + web upload | One-shot maintainer path. |
| `yarn verify:ai-search` | `yarn type-check && yarn lint && yarn test` | CI gate for the AI-search code. |

Both upload scripts create the HF repo if it does not exist, support `--prune`
to delete stale files, and require **public** repos (transformers.js fetches
with no auth, and the service worker caches the files at runtime).

---

## Cold start (new developer)

The AI tab is functional **out of the box** — you do **not** need to convert,
quantize, or upload anything:

```bash
yarn install
yarn verify:ai-search   # type-check + lint + vitest
yarn start              # dev server
```

Because:

- the **vector index** is committed (`quran_vectors.bin` + meta), and
- the **ONNX model** is committed (`atm-v2-onnx/`) **and** hosted on Hugging
  Face Hub — `constants/aiSearch.ts` points at `adelpro/atm-v2-int8-onnx`
  (native) and `adelpro/atm-v2-web` (web), both public.

On the very first AI search the app downloads the model from HF at runtime;
from then on it reuses the on-disk (native) / browser-cache (web) copy. No
Python environment is required unless you want to rebuild the vectors or
re-export a model.

---

## Reusing the hosted models (no re-quantization)

You can keep Adel's hosted models, serve the same model from your own HF repo,
or plug in a completely different ONNX embedding model.

### Option A — keep the default hosted models (recommended)

Change nothing. Both repos are public:
- native: `https://huggingface.co/adelpro/atm-v2-int8-onnx`
- web:    `https://huggingface.co/adelpro/atm-v2-web`

### Option B — serve the same model from your own HF repo

1. Copy the 4 native files from `assets/ai-search/atm-v2-onnx/`
   (`model.int8.onnx`, `tokenizer.json`, `tokenizer_config.json`,
   `special_tokens_map.json`) — or download them from
   `https://huggingface.co/adelpro/atm-v2-int8-onnx/tree/main`.
2. Upload to your repo (requires `HF_TOKEN` in `.env`):
   ```bash
   yarn build:model:upload youruser/your-repo
   ```
3. For web, prepare + upload the transformers.js layout:
   ```bash
   yarn prepare:web-layout
   yarn build:model:upload:web youruser/your-web-repo
   ```
4. Point the app at them:
   - **Native** base URL is overridable without a rebuild via the
     `EXPO_PUBLIC_AI_SEARCH_MODEL_URL` env var (see `constants/aiSearch.ts`).
   - **Web** repo id is a compile-time constant — edit `ATM_V2_WEB_REPO_ID` in
     `constants/aiSearch.ts`. The CDN the runtime loads from is overridable via
     `EXPO_PUBLIC_AI_SEARCH_WEB_CDN`.

### Option C — use a different ONNX embedding model

Any ONNX embedding model works, but **you must regenerate the vector index in
the same vector space**. The app compares the query embedding against
`quran_vectors.bin`, so the encoder that built the index must match the runtime
model, or search quality silently degrades.

1. Convert/quantize your model to INT8 ONNX:
   ```bash
   yarn build:model   # or adapt scripts/convert_onnx.py to your model id
   ```
2. Rebuild the vector index with the matching model + dimension:
   ```bash
   python scripts/build_vectors.py --model <your-model> --dim <your-dim>
   ```
3. Update `EMBEDDING_DIM` (and the model filename constant) in
   `constants/aiSearch.ts`, then follow Option B to host + point the app at the
   new layouts.

> **Note on Multiple Models / Dimensions**: each embedding model (or dimension
> size, e.g. 768 vs 256) lives in a distinct vector space. Switching models or
> dimensions **requires** a new matching vector index — never mix index and
> model from different encoders.

---

## Build pipeline (maintainers only)

### Prerequisites

- Python 3 with: `pip install transformers torch optimum[onnxruntime] onnxruntime huggingface_hub`

### Build the vector index

```bash
yarn build:vectors
# Or directly: python scripts/build_vectors.py [--model MODEL_ID] [--dim DIM]
```

This pipeline:
1. **Checks model availability** on HuggingFace and input files first; displays
   a clear error if missing/unreachable.
2. Encodes all 6,236 Quran verses (prefixed with Tafseer Al-Muyassar).
3. Mean-pools, L2-normalizes, and quantizes to Int8
   (`quran_vectors.bin` + `quran_vectors_meta.json`).

### Convert / Export ONNX model (optional)

The INT8 ONNX model is already tokenized and hosted (Option A), so **you do not
need to re-convert it**. Only re-run this if you change the model:

```bash
yarn build:model            # native layout only
yarn build:model:web        # native + web layout
```

Exports to `assets/ai-search/atm-v2-onnx/` (and `web/`).

### Upload to HuggingFace Hub (one-off)

```bash
# Authenticate
huggingface-cli login

# Native (4 flat files)
yarn build:model:upload youruser/your-repo

# Web (transformers.js layout, run yarn prepare:web-layout first)
yarn build:model:upload:web youruser/your-web-repo
```

### Run the full pipeline (maintainers only)

```bash
yarn build:ai:full          # vectors + model + both uploads
yarn verify:ai-search       # type-check + lint + tests
```

---

## Model

[Xenova/arabic-triplet-matryoshka-v2](https://huggingface.co/Xenova/arabic-triplet-matryoshka-v2)
(pre-quantized ONNX port of [Omartificial-Intelligence-Space/Arabic-Triplet-Matryoshka-V2](https://huggingface.co/Omartificial-Intelligence-Space/Arabic-Triplet-Matryoshka-V2))
- 135M params, 768-dim, AraBERT v02 base
- License: **Apache-2.0** — clean for App Store / Play Store
- Trained on 558k Arabic NLI triplets
- Paper: [GATE (arXiv:2505.24581)](https://arxiv.org/abs/2505.24581)

### Alternatives considered

- **mohamed2811/Muffakir_Embedding V1** — fine-tune of ATM-V2 on Egyptian legal
  Q&A + LLM synthetic. **No LICENSE file** (commercial-shipment risk). Same
  AraBERT v02 architecture, but fine-tuned on Egyptian legal data which shifts
  the embedding space *away* from MSA toward modern Egyptian legal dialect. Not used.
- **mohamed2811/Muffakir_Embedding_V2** — 568M params (BGE-M3), ~370 MB INT8
  ONNX. Too large for mobile.
- **Abdelkareem/Arabic-Triplet-Matryoshka-V2_distilled** — Model2Vec distilled,
  ~30 MB. Only path that fits a strict 70 MB budget; trades quality.

## Vector binary layout (`quran_vectors.bin`)

- Endianness: **little-endian** (matches ARM / iOS / Android / AMD64)
- dtype: `int8` (signed)
- shape: `(6236, 768)` row-major
- Each row corresponds to `quran_vectors_meta.json[i]` (which corresponds to `quran.json[gid - 1]`)

To reload at runtime:

```ts
import vectorMeta from '@/assets/ai-search/quran_vectors_meta.json';
import vectorBinUrl from '@/assets/ai-search/quran_vectors.bin';

const meta = vectorMeta;
const buf = await fetch(vectorBinUrl).then((r) => r.arrayBuffer());
const vectors = new Int8Array(buf);
// row at gid = N is vectors.subarray((N-1)*768, N*768)
```

## Cosine similarity

Vectors are L2-normalized at build time, so cosine similarity between a query
vector `q` and a stored row `r` is the dot product of the two L2-normalized
vectors — a value in [-1, 1].

For the stored int8 rows (scaled by 127) and a query vector in [-1, 1] range:

```ts
const dot = (q: Float32Array, r: Int8Array) => {
  let acc = 0;
  for (let i = 0; i < q.length; i++) acc += q[i] * r[i];
  return acc / 127; // normalize back to [-1, 1]
};
```
