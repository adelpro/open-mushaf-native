import { createJSONStorage } from 'jotai/utils';

export function createStorage<T>() {
  return createJSONStorage<T>();
}
