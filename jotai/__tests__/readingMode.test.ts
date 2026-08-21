import { createStore } from 'jotai';
import { describe, expect, it, vi } from 'vitest';

import { currentSavedPage, readingMode } from '../atoms';

const { mmkvStore } = vi.hoisted(() => {
  const mmkvStore = new Map<string, string>();
  return { mmkvStore };
});

vi.mock('react-native-mmkv', () => {
  return {
    MMKV: class {
      getString(key: string) {
        return mmkvStore.get(key) ?? null;
      }
      set(key: string, value: string) {
        mmkvStore.set(key, value);
      }
      delete(key: string) {
        mmkvStore.delete(key);
      }
      addOnValueChangedListener() {
        return { remove: () => {} };
      }
    },
  };
});

describe('readingMode atom', () => {
  it('defaults to horizontal', () => {
    const store = createStore();
    expect(store.get(readingMode)).toBe('horizontal');
  });

  it('persists the selected mode across restarts', async () => {
    const store = createStore();
    store.set(readingMode, 'vertical');
    expect(mmkvStore.get('ReadingMode')).toBe(JSON.stringify('vertical'));

    // Simulate an app restart: reload the module so the atom re-reads the
    // persisted value from storage at init time.
    vi.resetModules();
    const { readingMode: restartedReadingMode } = await import('../atoms');
    const restartedStore = createStore();
    expect(restartedStore.get(restartedReadingMode)).toBe('vertical');
  });

  it('switching mode does not change the current page', () => {
    const store = createStore();
    store.set(currentSavedPage, 42);
    store.set(readingMode, 'vertical');
    expect(store.get(currentSavedPage)).toBe(42);
  });

  it('changing the current page does not change the mode', () => {
    const store = createStore();
    store.set(currentSavedPage, 7);
    expect(store.get(readingMode)).toBe('horizontal');
  });

  it('does not introduce a separate vertical page state', () => {
    const store = createStore();
    store.set(readingMode, 'vertical');
    store.set(currentSavedPage, 13);

    // The vertical mode must reuse the single shared page source of truth;
    // no dedicated vertical page key may be persisted.
    expect([...mmkvStore.keys()]).not.toContain('VerticalCurrentPage');
    expect([...mmkvStore.keys()]).toContain('CurrentSavedPage');
  });
});
