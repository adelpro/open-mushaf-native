/**
 * Low-level fetch wrapper for the qurani.ai REST API.
 *
 * Responsibilities:
 *  - Build URLs from `QURANI_BASE` + a path.
 *  - Compose an internal `AbortController` with the caller's signal
 *    so a 15s timeout doesn't fight a manual cancel.
 *  - Retry 5xx with backoff (400ms / 1500ms). 4xx is not retried.
 *  - Validate the `{ code, status, data }` envelope.
 *  - Translate every failure mode into a discriminated `QuranApiError`.
 *
 * Consumers (e.g. `quran.ts`, `editions.ts`) wrap these calls with
 * domain-specific types — `client.ts` stays domain-agnostic.
 */

import { QuranApiEnvelope, QuranApiError } from './types';

export const QURANI_BASE = 'https://api.qurani.ai/gw/qh/v1';

const DEFAULT_TIMEOUT_MS = 15_000;
const RETRY_DELAY_MS = [400, 1500] as const;
const MAX_ATTEMPTS = RETRY_DELAY_MS.length + 1;

export type QuraniFetchOpts = {
  /** External abort signal — composed with the internal timeout. */
  signal?: AbortSignal;
  /** Override per-call timeout (ms). Defaults to 15s. */
  timeoutMs?: number;
  /** Set `false` to skip retries (e.g. for write paths). Defaults to true. */
  retry?: boolean;
};

const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

/**
 * GET `path` against the qurani.ai base URL and return the unwrapped
 * `data` payload. Throws `QuranApiError` on any failure.
 */
export async function quraniGet<T>(
  path: string,
  opts: QuraniFetchOpts = {},
): Promise<T> {
  const url = `${QURANI_BASE}${path}`;
  const retry = opts.retry !== false;
  const timeoutMs = opts.timeoutMs ?? DEFAULT_TIMEOUT_MS;

  // Internal controller is composed with the caller's signal:
  //   - timeoutMs expires → controller.abort() → throws 'timeout'
  //   - caller aborts → opts.signal abort fires → controller.abort() →
  //     throws 'aborted'
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  if (opts.signal) {
    if (opts.signal.aborted) controller.abort();
    opts.signal.addEventListener('abort', () => controller.abort(), {
      once: true,
    });
  }

  let lastErr: unknown = null;
  try {
    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
      try {
        const res = await fetch(url, {
          signal: controller.signal,
          headers: { Accept: 'application/json' },
        });

        if (res.status >= 500) {
          if (retry && attempt < RETRY_DELAY_MS.length) {
            await sleep(RETRY_DELAY_MS[attempt] ?? 0);
            continue;
          }
          throw new QuranApiError(
            'http-5xx',
            `qurani.ai ${res.status} ${res.statusText} for ${path}`,
            { status: res.status, url },
          );
        }

        if (!res.ok) {
          throw new QuranApiError(
            'http-4xx',
            `qurani.ai ${res.status} ${res.statusText} for ${path}`,
            { status: res.status, url },
          );
        }

        const raw = (await res.json()) as Partial<QuranApiEnvelope<T>>;
        if (
          !raw ||
          typeof raw !== 'object' ||
          raw.code !== 200 ||
          !('data' in raw)
        ) {
          throw new QuranApiError(
            'parse',
            `qurani.ai bad envelope for ${path}: ${JSON.stringify(raw).slice(0, 200)}`,
            { url },
          );
        }
        return raw.data as T;
      } catch (err) {
        lastErr = err;

        // Re-thrown QuranApiError → bubble immediately for non-retriable.
        if (err instanceof QuranApiError) {
          if (err.kind === 'http-4xx' || err.kind === 'parse') throw err;
        }

        // AbortController fired → translate into 'aborted' or 'timeout'
        // depending on which side aborted.
        if (controller.signal.aborted) {
          const kind: 'aborted' | 'timeout' = opts.signal?.aborted
            ? 'aborted'
            : 'timeout';
          throw new QuranApiError(kind, `qurani.ai ${kind} for ${path}`, {
            url,
          });
        }

        // Network-level failure — try again with backoff.
        if (!retry || attempt >= RETRY_DELAY_MS.length) break;
        await sleep(RETRY_DELAY_MS[attempt] ?? 0);
      }
    }

    // Out of attempts — translate the last caught error.
    if (lastErr instanceof QuranApiError) throw lastErr;
    throw new QuranApiError(
      'offline',
      `qurani.ai unreachable for ${path}: ${
        lastErr instanceof Error ? lastErr.message : String(lastErr)
      }`,
      { url },
    );
  } finally {
    clearTimeout(timer);
  }
}
