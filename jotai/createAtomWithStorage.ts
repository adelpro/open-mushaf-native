import { atomWithStorage } from 'jotai/utils';

import { createStorage } from './storage';

/**
 * Creates a custom atom with storage that includes pre-configured storage and options
 * @param key The storage key
 * @param initialValue The initial value
 * @returns An atom with storage
 */
export function createAtomWithStorage<T>(key: string, initialValue: T) {
  return atomWithStorage<T>(key, initialValue, createStorage<T>(), {
    getOnInit: true,
  });
}
