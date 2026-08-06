// @vitest-environment jsdom
/**
 * Vitest specs for the web embedder (utils/aiSearch/embedderRuntime.web.ts).
 *
 * The web embedder loads @huggingface/transformers from a CDN at runtime
 * via `public/ai/transformers-loader.js` (copied verbatim to dist/ai/ by
 * `yarn web:export`). These tests stub the DOM + global module reference
 * to exercise the loader injection, env configuration, and embed pipeline
 * without a real network call.
 *
 * Key invariants:
 *   1. `createEmbedder` does NOT fetch anything itself — it only injects a
 *      <script type="module">. The actual import happens inside the loader.
 *   2. `env.allowLocalModels` is set to false BEFORE the pipeline is built,
 *      so transformers.js doesn't probe `/models` on our own origin.
 *   3. `embed()` returns a Float32Array of length 768, L2-normalized (mean
 *      pool + normalize is performed inside transformers.js, not here).
 *   4. CDN failures surface as `cdn-blocked: …` so `useHybridSearch.classify`
 *      can route them.
 *
 * Vitest does not apply Metro's `.web.ts` resolution, so we import the file
 * by its explicit path. The runtime guard `if (typeof window === 'undefined')`
 * is short-circuited by `jsdom` (declared above).
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Stub the constants so the test doesn't depend on them changing.
vi.mock('@/constants/aiSearch', () => ({
  AI_SEARCH_WEB_CDN_URL: 'https://cdn.example.test/transformers.js',
  AI_SEARCH_LOADER_PATH: '/ai/transformers-loader.js',
  ATM_V2_WEB_REPO_ID: 'test/web-repo',
}));

interface SyntheticPipeline {
  callCount: number;
  lastText: string | null;
  lastOpts: Record<string, unknown> | null;
  returnValue: { data: Float32Array; dims: number[] };
}

interface SyntheticEnv {
  allowLocalModels: boolean;
  useBrowserCache: boolean;
  remoteHost: string;
  backends: {
    onnx: {
      wasm: {
        proxy: boolean;
        numThreads: number;
      };
    };
  };
}

interface SyntheticTransformers {
  pipeline: ReturnType<typeof vi.fn>;
  env: SyntheticEnv;
}

let transformers: SyntheticTransformers;
let pipeline: SyntheticPipeline;
let createdScripts: {
  type: string;
  src: string;
  onerror: (() => void) | null;
}[];

beforeEach(() => {
  transformers = {
    pipeline: vi.fn(),
    env: {
      allowLocalModels: true,
      useBrowserCache: false,
      remoteHost: '',
      backends: {
        onnx: { wasm: { proxy: true, numThreads: 4 } },
      },
    },
  };
  pipeline = {
    callCount: 0,
    lastText: null,
    lastOpts: null,
    returnValue: {
      data: new Float32Array(768).map((_, i) => (i === 0 ? 1 : 0)),
      dims: [1, 1, 768],
    },
  };
  transformers.pipeline.mockResolvedValue(
    (text: string, opts: Record<string, unknown>) => {
      pipeline.callCount += 1;
      pipeline.lastText = text;
      pipeline.lastOpts = opts;
      return Promise.resolve(pipeline.returnValue);
    },
  );

  createdScripts = [];
  const head = {
    appendChild: vi.fn((el: HTMLScriptElement) => {
      createdScripts.push({
        type: el.type,
        src: el.src,
        onerror: el.onerror as () => void,
      });
    }),
  };
  const doc = {
    createElement: vi.fn((tag: string) => {
      if (tag === 'script') {
        return {
          type: '',
          src: '',
          onerror: null as (() => void) | null,
        } as HTMLScriptElement;
      }
      return {} as HTMLElement;
    }),
    head,
  };
  Object.defineProperty(globalThis, 'document', {
    value: doc,
    configurable: true,
    writable: true,
  });
});

afterEach(() => {
  delete (globalThis as any).__transformers;
  delete (globalThis as any).__AI_CDN_URL;
  delete (globalThis as any).__transformersError;
  vi.restoreAllMocks();
});

/** Pretend the loader script already finished. */
function injectTransformersModule(): void {
  (globalThis as any).__transformers = transformers;
}

describe('embedderRuntime.web.createEmbedder', () => {
  it('is lazy: does not call pipeline() during createEmbedder()', async () => {
    injectTransformersModule();
    const { createEmbedder } = await import('../embedderRuntime.web');
    const embedder = await createEmbedder(null, 'test/web-repo');
    expect(transformers.pipeline).not.toHaveBeenCalled();
    expect(typeof embedder.embed).toBe('function');
  });

  it('configures env before building the pipeline', async () => {
    injectTransformersModule();
    const { createEmbedder } = await import('../embedderRuntime.web');
    const embedder = await createEmbedder(null, 'test/web-repo');
    // Force pipeline build by calling embed().
    await embedder.embed('hello');
    expect(transformers.env.allowLocalModels).toBe(false);
    expect(transformers.env.useBrowserCache).toBe(true);
    expect(transformers.env.remoteHost).toBe('https://huggingface.co');
    expect(transformers.env.backends.onnx.wasm.proxy).toBe(false);
    expect(transformers.env.backends.onnx.wasm.numThreads).toBe(1);
  });

  it('builds the pipeline with dtype:q8 and device:wasm', async () => {
    injectTransformersModule();
    const { createEmbedder } = await import('../embedderRuntime.web');
    const embedder = await createEmbedder(null, 'test/web-repo');
    await embedder.embed('hello');
    expect(transformers.pipeline).toHaveBeenCalledWith(
      'feature-extraction',
      'test/web-repo',
      expect.objectContaining({
        dtype: 'q8',
        device: 'wasm',
        progress_callback: expect.any(Function),
      }),
    );
  });

  it('embed() passes pooling:mean and normalize:true', async () => {
    injectTransformersModule();
    const { createEmbedder } = await import('../embedderRuntime.web');
    const embedder = await createEmbedder(null, 'test/web-repo');
    await embedder.embed('hello');
    expect(pipeline.lastText).toBe('hello');
    expect(pipeline.lastOpts).toEqual({
      pooling: 'mean',
      normalize: true,
    });
  });

  it('embed() returns a Float32Array of length 768', async () => {
    injectTransformersModule();
    const { createEmbedder } = await import('../embedderRuntime.web');
    const embedder = await createEmbedder(null, 'test/web-repo');
    const out = await embedder.embed('hello');
    expect(out).toBeInstanceOf(Float32Array);
    expect(out.length).toBe(768);
  });

  it('forwards progress callbacks', async () => {
    injectTransformersModule();
    const { createEmbedder } = await import('../embedderRuntime.web');
    const onProgress = vi.fn();
    const embedder = await createEmbedder(null, 'test/web-repo', onProgress);
    await embedder.embed('hello');
    const progressCallback = (
      transformers.pipeline.mock.calls[0]?.[2] as {
        progress_callback: (info: unknown) => void;
      }
    ).progress_callback;
    progressCallback({ status: 'progress', loaded: 50, total: 100, file: 'a' });
    expect(onProgress).toHaveBeenCalledWith({
      bytesDownloaded: 50,
      totalBytes: 100,
      fileName: 'a',
    });
    progressCallback({ status: 'progress_total', loaded: 200, total: 400 });
    expect(onProgress).toHaveBeenLastCalledWith({
      bytesDownloaded: 200,
      totalBytes: 400,
    });
    progressCallback({ status: 'ready' });
    expect(onProgress).toHaveBeenLastCalledWith({
      bytesDownloaded: 0,
      totalBytes: 0,
    });
  });

  it('injects the loader script when no module is loaded yet', async () => {
    // No injectTransformersModule() call this time.
    let promise!: Promise<unknown>;
    const { createEmbedder } = await import('../embedderRuntime.web');
    promise = createEmbedder(null, 'test/web-repo');
    // Wait a microtask so the script-injection Promise gets created.
    await new Promise((r) => setTimeout(r, 0));
    expect(createdScripts).toHaveLength(1);
    expect(createdScripts[0].type).toBe('module');
    expect(createdScripts[0].src).toBe('/ai/transformers-loader.js');
    // Now simulate the loader finishing by publishing the module on
    // globalThis and dispatching the ready event.
    (globalThis as any).__transformers = transformers;
    globalThis.dispatchEvent(new Event('transformers:ready'));
    await promise;
  });

  it('surfaces loader errors as cdn-blocked', async () => {
    let promise!: Promise<unknown>;
    const { createEmbedder } = await import('../embedderRuntime.web');
    promise = createEmbedder(null, 'test/web-repo');
    await new Promise((r) => setTimeout(r, 0));
    // Simulate the loader failing.
    (globalThis as any).__transformersError = 'jsdelivr returned 503';
    globalThis.dispatchEvent(new Event('transformers:error'));
    await expect(promise).rejects.toThrow(/^cdn-blocked:/);
  });

  it('retags WASM errors from embed() as wasm-init', async () => {
    injectTransformersModule();
    transformers.pipeline.mockRejectedValueOnce(
      new Error('Aborted(onnxruntime::wasm::Error): out of memory'),
    );
    const { createEmbedder } = await import('../embedderRuntime.web');
    const embedder = await createEmbedder(null, 'test/web-repo');
    await expect(embedder.embed('hello')).rejects.toThrow(/^wasm-init:/);
  });

  it('retags HF fetch errors from embed() as model-load', async () => {
    injectTransformersModule();
    transformers.pipeline.mockRejectedValueOnce(
      new Error('Unauthorized access to file: "https://huggingface.co/foo"'),
    );
    const { createEmbedder } = await import('../embedderRuntime.web');
    const embedder = await createEmbedder(null, 'test/web-repo');
    await expect(embedder.embed('hello')).rejects.toThrow(/^model-load:/);
  });
});
