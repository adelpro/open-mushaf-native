/**
 * Web stub for the ONNX runtime adapter.
 *
 * Metro resolves this file instead of `embedderRuntime.ts` when bundling
 * for web, so the heavy `@huggingface/transformers` package
 * (`transformers.web.js` plus its WASM modules — multi-MB each) is never
 * pulled into the web bundle. That bundle currently OOMs Metro during
 * `yarn web:export` / `yarn start --web`.
 *
 * Until we move to a lighter web ML runtime (or pre-bundle transformers via
 * Workbox), web AI search surfaces a clear "not yet available" error and
 * the search screen falls back to keyword-only results.
 */

import type { DenseEmbedder } from './types';

const WEB_AI_UNAVAILABLE =
  'Web AI search is not yet available. The @huggingface/transformers ' +
  'package is too large for the current Metro web bundle. Use the native ' +
  'app for AI search, or visit /dev/ai-search for diagnostics.';

export async function createEmbedder(
  _modelPath: string | null,
  _repoId: string,
): Promise<DenseEmbedder> {
  throw new Error(WEB_AI_UNAVAILABLE);
}
