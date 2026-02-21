/**
 * In-memory rate limiter for client-side API protection.
 * Implements a sliding window algorithm per action key.
 */

interface RateLimitEntry {
  timestamps: number[];
}

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterMs: number;
}

const store = new Map<string, RateLimitEntry>();

/**
 * Check and record a request against the rate limit for a given key.
 *
 * @param key     - Unique identifier for the action
 * @param config  - Rate limit configuration
 * @returns       RateLimitResult describing whether the request is allowed
 */
export function checkRateLimit(
  key: string,
  config: RateLimitConfig,
): RateLimitResult {
  const { maxRequests, windowMs } = config;
  const now = Date.now();
  const windowStart = now - windowMs;

  const entry = store.get(key) ?? { timestamps: [] };

  entry.timestamps = entry.timestamps.filter((t) => t > windowStart);

  const remaining = Math.max(0, maxRequests - entry.timestamps.length);

  if (entry.timestamps.length >= maxRequests) {
    const oldestInWindow = entry.timestamps[0]!;
    const retryAfterMs = oldestInWindow - windowStart;

    store.set(key, entry);
    return { allowed: false, remaining: 0, retryAfterMs };
  }

  entry.timestamps.push(now);
  store.set(key, entry);

  return { allowed: true, remaining: remaining - 1, retryAfterMs: 0 };
}

/**
 * Reset the rate limit for a given key.
 */
export function resetRateLimit(key: string): void {
  store.delete(key);
}

/**
 * Structured error thrown when a rate limit is exceeded.
 */
export class RateLimitError extends Error {
  public readonly retryAfterMs: number;
  public readonly retryAfterSeconds: number;

  constructor(retryAfterMs: number) {
    const seconds = Math.ceil(retryAfterMs / 1000);
    super(
      `Too many requests. Please try again in ${seconds} second${seconds !== 1 ? 's' : ''}.`,
    );
    this.name = 'RateLimitError';
    this.retryAfterMs = retryAfterMs;
    this.retryAfterSeconds = seconds;
  }
}
