/**
 * Web embedder for the AI semantic search subsystem.
 *
 * Metro resolves this file instead of `embedderRuntime.ts` when bundling
 * for web. The companion `public/ai/transformers-loader.js` (shipped to
 * `dist/ai/` by `yarn web:export`) imports `@huggingface/transformers`
 * from a CDN at runtime and publishes the module on `globalThis`. This
 * file injects that loader with a `<script type="module" src>` tag,
 * waits for the load to finish, and turns the namespace into a
 * `DenseEmbedder`.
 *
 * Why a CDN at all? Metro cannot bundle `@huggingface/transformers` —
 * the package contains `import.meta`, `new Worker`, and unresolved
 * `.wasm` URLs that Metro's transformer rejects. Verified error from
 * `yarn web:export`:
 *
 *   SyntaxError: node_modules/onnxruntime-web/dist/ort.webgpu.bundle.min.mjs
 *     Invalid call at line 8: import(dynamic-specifier-with-webpackIgnore-and-vite-ignore)
 *
 * The browser's own ESM loader handles all of that natively, so we hand
 * the job to the browser instead of fighting Metro.
 *
 * The pipeline is built lazily on the first `embed()` call so this
 * module's mere import costs nothing during prerender (`output: "static"`
 * still walks every route in Node).
 */

import {
  AI_SEARCH_LOADER_PATH,
  AI_SEARCH_WEB_CDN_URL,
  ATM_V2_WEB_REPO_ID,
} from '@/constants/aiSearch';

import type { DenseEmbedder, DownloadProgress } from './types';

// ---------------------------------------------------------------------------
// Static prerender guard
// ---------------------------------------------------------------------------
//
// `output: "static"` in app.json runs every route through Node, so this
// module gets imported in a window-less environment. Throw immediately
// so the prerender step fails loudly instead of silently producing a
// broken static page.

if (typeof window === 'undefined') {
  throw new Error(
    'Web AI search embedder must not be imported during server-side ' +
      'prerender. guard(typeof window === "undefined") in ' +
      'embedderRuntime.web.ts',
  );
}

// ---------------------------------------------------------------------------
// Loader injection
// ---------------------------------------------------------------------------
//
// The loader script is a plain ES module placed in `public/ai/`. Metro
// never sees it; Expo copies it verbatim to `dist/ai/transformers-loader.js`,
// and `workbox-config.js` already precaches `*.js` so it is served as
// part of the SW cache.
//
// We resolve the load via a `transformers:ready` / `transformers:error`
// event pair rather than awaiting a global promise so the loader script
// stays a pure top-level-await module with no app-specific coupling.

interface TransformersModule {
  pipeline: (
    task: string,
    repoId: string,
    options?: Record<string, unknown>,
  ) => Promise<unknown>;
  env: {
    allowLocalModels?: boolean;
    useBrowserCache?: boolean;
    remoteHost?: string;
    backends?: {
      onnx?: {
        wasm?: {
          proxy?: boolean;
          numThreads?: number;
        };
      };
    };
    cache?: { clear?: () => Promise<void> };
  };
}

declare global {
  var __transformers: TransformersModule | undefined;

  var __AI_CDN_URL: string | undefined;

  var __transformersError: string | undefined;
}

function loadTransformers(): Promise<TransformersModule> {
  if (globalThis.__transformers) {
    return Promise.resolve(globalThis.__transformers);
  }
  return new Promise<TransformersModule>((resolve, reject) => {
    globalThis.__AI_CDN_URL = AI_SEARCH_WEB_CDN_URL;
    globalThis.addEventListener(
      'transformers:ready',
      () => {
        const mod = globalThis.__transformers;
        if (mod) {
          resolve(mod);
        } else {
          reject(
            new Error(
              'cdn-blocked: loader reported ready but globalThis.__transformers is unset',
            ),
          );
        }
      },
      { once: true },
    );
    globalThis.addEventListener(
      'transformers:error',
      () => {
        const detail = globalThis.__transformersError ?? 'unknown';
        reject(new Error(`cdn-blocked: ${detail}`));
      },
      { once: true },
    );
    const s = document.createElement('script');
    s.type = 'module';
    s.src = AI_SEARCH_LOADER_PATH;
    s.onerror = () =>
      reject(
        new Error(
          'cdn-blocked: loader script failed to fetch (network error or 404)',
        ),
      );
    document.head.appendChild(s);
  });
}

// ---------------------------------------------------------------------------
// Progress mapping
// ---------------------------------------------------------------------------
//
// transformers.js progress_callback emits a `ProgressInfo` with status:
//
//   'initiate'       — file fetch is about to start
//   'download'       — file fetch started
//   'progress'       — per-file bytes received
//   'progress_total' — across-all-files bytes received
//   'done'           — file fetch complete
//   'ready'          — pipeline ready (one-time)
//
// We map this onto the existing `DownloadProgress` contract used by
// `app/search.tsx` so the blue download banner can show byte counts
// without any UI changes.

interface ProgressInfo {
  status: string;
  file?: string;
  loaded?: number;
  total?: number;
}

function makeProgressCallback(
  onProgress?: (p: DownloadProgress) => void,
): (info: ProgressInfo) => void {
  return (info) => {
    if (!onProgress) return;
    switch (info.status) {
      case 'progress':
        if (info.loaded != null && info.total != null) {
          onProgress({
            bytesDownloaded: info.loaded,
            totalBytes: info.total,
            fileName: info.file,
          });
        }
        break;
      case 'progress_total':
        if (info.loaded != null && info.total != null) {
          onProgress({
            bytesDownloaded: info.loaded,
            totalBytes: info.total,
          });
        }
        break;
      case 'ready':
        // Clear the banner — the banner treats 0 bytes as "done".
        onProgress({
          bytesDownloaded: 0,
          totalBytes: 0,
        });
        break;
      case 'initiate':
      case 'download':
      case 'done':
      default:
        // Ignore — these are state-change signals, not byte counts.
        break;
    }
  };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Construct a web embedder. The `modelPath` argument is ignored on web —
 * transformers.js fetches the model from `ATM_V2_WEB_REPO_ID` directly.
 * Kept in the signature so the shared `createEmbedder` call site works
 * unchanged across platforms.
 */
export async function createEmbedder(
  _modelPath: string | null,
  _repoId: string,
  onProgress?: (p: DownloadProgress) => void,
): Promise<DenseEmbedder> {
  const mod = await loadTransformers();

  // Configure env BEFORE the first pipeline() call.
  mod.env.allowLocalModels = false;
  mod.env.useBrowserCache = true;
  mod.env.remoteHost = 'https://huggingface.co';
  if (mod.env.backends?.onnx?.wasm) {
    mod.env.backends.onnx.wasm.proxy = false;
    // Single-threaded: avoids SharedArrayBuffer + cross-origin isolation.
    mod.env.backends.onnx.wasm.numThreads = 1;
  }

  // Pipeline is built lazily on the first embed() call so a misconfigured
  // HF repo or a wasm failure surfaces inside embed() (where we can retag
  // the message) rather than during createEmbedder() (which would lose the
  // specific failure reason in the call site).
  type Pipe = (
    text: string,
    opts: Record<string, unknown>,
  ) => Promise<{ data: Float32Array; dims: number[] }>;

  let pipePromise: Promise<Pipe> | null = null;

  function getPipe(): Promise<Pipe> {
    if (!pipePromise) {
      const built = mod.pipeline('feature-extraction', ATM_V2_WEB_REPO_ID, {
        dtype: 'q8',
        device: 'wasm',
        progress_callback: makeProgressCallback(onProgress),
      }) as Promise<Pipe>;
      pipePromise = built;
    }
    return pipePromise;
  }

  return {
    async embed(text: string): Promise<Float32Array> {
      // transformers.js performs masked mean-pool + L2 normalize when
      // pooling:'mean', normalize:true — matching scripts/build_vectors.py
      // and the native meanPool() in embedderRuntime.ts.
      try {
        const pipe = await getPipe();
        const out = await pipe(text, { pooling: 'mean', normalize: true });
        return new Float32Array(out.data);
      } catch (err) {
        const detail = err instanceof Error ? err.message : String(err);
        if (/wasm|WebAssembly|abort/i.test(detail)) {
          throw new Error(`wasm-init: ${detail}`);
        }
        if (
          /Unauthorized access to file|HTTP|404|fetch|onnx|model_quantized|config\.json/i.test(
            detail,
          )
        ) {
          throw new Error(`model-load: ${detail}`);
        }
        throw err;
      }
    },
    dispose() {
      // transformers.js does not expose a public dispose() at the module
      // level; the pipeline's internal ONNX session is GC'd once the
      // embedder is unreferenced. The user can clear all caches via
      // Settings → "إعادة تعيين البحث الذكي" which calls
      // clearCachedModel(), which we extend to also drop the loader's
      // module reference.
    },
  };
}
