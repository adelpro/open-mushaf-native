import { createJSONStorage } from 'jotai/utils';

/**
 * Creates a standard JSON storage adapter for Jotai atoms on the web platform.
 * Relies on Jotai's default browser storage methods.
 *
 * @returns A standard configured JSON storage object.
 */
export function createStorage<T>() {
  return createJSONStorage<T>();
}
