/**
 * Persistent debug log for the AI search subsystem.
 *
 * In dev: passes through to `console.{info,warn,error}` so messages show in
 * the Metro / browser dev console.
 *
 * In prod: writes a capped JSON ring buffer to the dedicated `ai-search`
 * MMKV instance so we can inspect failures after the fact. The dev-only
 * `app/dev/ai-search.tsx` diagnostics screen reads this buffer.
 *
 * Why not just `console.*` everywhere? `babel.config.js` strips every
 * `console.*` call from production builds via `transform-remove-console`,
 * so without this transport we'd be back to a silent failure.
 */

import { MMKV } from 'react-native-mmkv';

export type LogKind = 'info' | 'warn' | 'error';

type LogEntry = {
  t: number;
  k: LogKind;
  m: string;
  c: Record<string, unknown> | null;
};

const KEY = 'debug-log';
const MAX_ENTRIES = 50;

// Dedicated MMKV — shared with loadEmbedderModel.ts so the diagnostics
// screen can also clear the model cache from the same namespace.
const storage = new MMKV({ id: 'ai-search' });

/**
 * Append a debug event. Safe to call from any path that may run in dev or
 * production. Failures inside this function are swallowed so the calling
 * code never crashes because logging broke.
 *
 * Writes to MMKV in BOTH dev and prod so the `/dev/ai-search` diagnostics
 * screen can show the log. In dev we ALSO forward to `console.*` so the
 * existing dev-server workflow keeps working — the prod build is unaffected
 * because the dev branch is only reached when `__DEV__` is true.
 */
export function logEvent(
  kind: LogKind,
  msg: string,
  ctx?: Record<string, unknown>,
): void {
  try {
    const entry: LogEntry = {
      t: Date.now(),
      k: kind,
      m: msg,
      c: ctx ?? null,
    };
    const prev = storage.getString(KEY)?.split('\n').filter(Boolean) ?? [];
    prev.push(JSON.stringify(entry));
    while (prev.length > MAX_ENTRIES) prev.shift();
    storage.set(KEY, prev.join('\n'));
    if (__DEV__) {
      console[kind](`[ai-search] ${msg}`, ctx ?? '');
    }
  } catch {
    // best-effort — never let a logging call throw into the search path
  }
}

/** Read the ring buffer (newest-last). Returns an empty array on failure. */
export function readDebugLog(): LogEntry[] {
  try {
    const raw = storage.getString(KEY)?.split('\n').filter(Boolean) ?? [];
    return raw
      .map((line) => {
        try {
          return JSON.parse(line) as LogEntry;
        } catch {
          return null;
        }
      })
      .filter((e): e is LogEntry => e !== null);
  } catch {
    return [];
  }
}

/** Wipe the ring buffer. */
export function clearDebugLog(): void {
  try {
    storage.delete(KEY);
  } catch {
    // best-effort
  }
}
