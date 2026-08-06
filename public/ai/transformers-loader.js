/**
 * Runtime loader for @huggingface/transformers on web.
 *
 * This script lives in `public/` so Metro never processes it — Expo copies
 * it verbatim into `dist/ai/transformers-loader.js` during `yarn web:export`.
 * The browser's own ESM loader is what handles the dynamic import below;
 * Metro cannot, because the transformers.js bundle contains `import.meta`,
 * `new Worker`, and unresolved `.wasm` URLs that Metro cannot transform.
 *
 * The companion `utils/aiSearch/embedderRuntime.web.ts` injects this file
 * with a `<script type="module" src>` tag and listens for the events fired
 * at the bottom of this file. Results are published on `globalThis` so the
 * app code never has to touch the module system.
 *
 * No `eval`, no dynamic specifier for Metro to choke on (Metro never sees
 * this file), and `*.js` is already in `workbox-config.js` `globPatterns`
 * so the SW precaches it.
 */

const DEFAULT_CDN =
  'https://cdn.jsdelivr.net/npm/@huggingface/transformers@4.2.0/+esm';

const CDN_URL = globalThis.__AI_CDN_URL || DEFAULT_CDN;

try {
  const mod = await import(CDN_URL);
  globalThis.__transformers = mod;
  globalThis.dispatchEvent(new Event('transformers:ready'));
} catch (err) {
  globalThis.__transformersError =
    err instanceof Error ? err.message : String(err);
  globalThis.dispatchEvent(new Event('transformers:error'));
}
