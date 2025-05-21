import { createJSONStorage } from 'jotai/utils';
import { MMKV } from 'react-native-mmkv';

const mmkv = new MMKV();

const storage = {
  getItem: (key: string): string | null => mmkv.getString(key) ?? null,
  setItem: (key: string, value: string): void => mmkv.set(key, value),
  removeItem: (key: string): void => mmkv.delete(key),
  subscribe: (
    key: string,
    callback: (value: string | null) => void,
  ): (() => void) => {
    const listener = (changedKey: string) => {
      if (changedKey === key) callback(storage.getItem(key));
    };
    const { remove } = mmkv.addOnValueChangedListener(listener);
    return () => remove();
  },
};

export function createStorage<T>() {
  return createJSONStorage<T>(() => storage);
}
