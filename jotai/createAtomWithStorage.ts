import { atomWithStorage } from 'jotai/utils';

import { createStorage } from '@/utils/storage/createStorage';

export function createAtomWithStorage<T>(key: string, initialValue: T) {
  return atomWithStorage<T>(key, initialValue, createStorage<T>(), {
    getOnInit: true,
  });
}
