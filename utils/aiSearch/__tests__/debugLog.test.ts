/**
 * Vitest specs for the persistent AI-search debug log.
 *
 * Covers:
 *   - dev passthrough via console.{info,warn,error}
 *   - production MMKV ring buffer (cap at 50 entries)
 *   - JSON round-trip via readDebugLog / clearDebugLog
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// `__DEV__` is a Metro constant; the rn-stub doesn't define it. Inject one
// for the duration of this test file so the logEvent branch we exercise is
// deterministic.
declare const global: typeof globalThis & {
  __DEV__?: boolean;
};

let currentDev = false;
Object.defineProperty(global, '__DEV__', {
  get: () => currentDev,
  configurable: true,
});

const consoleInfo = vi.spyOn(console, 'info').mockImplementation(() => {});
const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {});
const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

beforeEach(async () => {
  currentDev = false;
  consoleInfo.mockClear();
  consoleWarn.mockClear();
  consoleError.mockClear();
  // Fresh MMKV per test
  const { clearDebugLog } = await import('../debugLog');
  clearDebugLog();
});

afterEach(() => {
  vi.resetModules();
});

describe('debugLog', () => {
  it('passes through to console.* in dev mode', async () => {
    currentDev = true;
    const { logEvent, readDebugLog } = await import('../debugLog');
    logEvent('info', 'hello');
    logEvent('warn', 'careful');
    logEvent('error', 'boom');
    expect(consoleInfo).toHaveBeenCalledWith('[ai-search] hello', '');
    expect(consoleWarn).toHaveBeenCalledWith('[ai-search] careful', '');
    expect(consoleError).toHaveBeenCalledWith('[ai-search] boom', '');
    // Dev mode also writes to MMKV so /dev/ai-search can show the log.
    const entries = readDebugLog();
    expect(entries).toHaveLength(3);
    void currentDev;
  });

  it('writes to MMKV ring buffer in production', async () => {
    currentDev = false;
    const { logEvent, readDebugLog } = await import('../debugLog');
    logEvent('info', 'one');
    logEvent('warn', 'two', { fileName: 'tokenizer.json' });
    logEvent('error', 'three');
    const entries = readDebugLog();
    expect(entries).toHaveLength(3);
    expect(entries[0].m).toBe('one');
    expect(entries[1].k).toBe('warn');
    expect(entries[1].c).toEqual({ fileName: 'tokenizer.json' });
    expect(entries[2].k).toBe('error');
  });

  it('caps the ring buffer at 50 entries', async () => {
    currentDev = false;
    const { logEvent, readDebugLog } = await import('../debugLog');
    for (let i = 0; i < 60; i++) {
      logEvent('info', `msg-${i}`);
    }
    const entries = readDebugLog();
    expect(entries).toHaveLength(50);
    // Oldest entries are dropped; the last entry written is at the end.
    expect(entries[0].m).toBe('msg-10');
    expect(entries[49].m).toBe('msg-59');
  });

  it('clears the buffer', async () => {
    currentDev = false;
    const { logEvent, readDebugLog, clearDebugLog } =
      await import('../debugLog');
    logEvent('info', 'x');
    expect(readDebugLog()).toHaveLength(1);
    clearDebugLog();
    expect(readDebugLog()).toHaveLength(0);
  });

  void consoleInfo;
  void consoleWarn;
  void consoleError;

  it('survives malformed JSON lines in the buffer', async () => {
    currentDev = false;
    const { logEvent, readDebugLog, clearDebugLog } =
      await import('../debugLog');
    // Write a valid entry, then poison the buffer directly, then write again.
    logEvent('info', 'before');
    const { MMKV } = await import('react-native-mmkv');
    const mmkv = new MMKV({ id: 'ai-search' });
    const prev = mmkv.getString('debug-log') ?? '';
    mmkv.set('debug-log', `${prev}\n{not-json}\n${prev.split('\n').pop()}`);
    const entries = readDebugLog();
    // We get two valid entries; the malformed line is skipped.
    expect(entries.every((e) => typeof e.m === 'string')).toBe(true);
    clearDebugLog();
  });
});
