import AsyncStorage from '@react-native-async-storage/async-storage';
import { createJSONStorage } from 'jotai/utils';

// Try to import MMKV, fallback to AsyncStorage if not available (e.g., in Expo Go)
let mmkv: any = null;
let useMMKV = false;

try {
  const { MMKV } = require('react-native-mmkv');
  mmkv = new MMKV();
  useMMKV = true;
  console.log('Using MMKV for storage');
} catch (error) {
  console.log('MMKV not available, using AsyncStorage for Expo Go');
  useMMKV = false;
}

// Sync cache for AsyncStorage to make it work with jotai's sync storage interface
const asyncStorageCache = new Map<string, string>();

// Initialize cache from AsyncStorage
const initAsyncStorageCache = async () => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const items = await AsyncStorage.multiGet(keys);
    items.forEach(([key, value]) => {
      if (value !== null) {
        asyncStorageCache.set(key, value);
      }
    });
  } catch (error) {
    console.error('Failed to initialize AsyncStorage cache:', error);
  }
};

// Initialize cache on module load
if (!useMMKV) {
  initAsyncStorageCache();
}

const storage = {
  getItem: (key: string): string | null => {
    if (useMMKV && mmkv) {
      return mmkv.getString(key) ?? null;
    }
    // Return from cache for sync compatibility with jotai
    return asyncStorageCache.get(key) ?? null;
  },
  setItem: (key: string, value: string): void => {
    if (useMMKV && mmkv) {
      mmkv.set(key, value);
    } else {
      // Update cache immediately for sync access
      asyncStorageCache.set(key, value);
      // Persist to AsyncStorage asynchronously
      AsyncStorage.setItem(key, value).catch(console.error);
    }
  },
  removeItem: (key: string): void => {
    if (useMMKV && mmkv) {
      mmkv.delete(key);
    } else {
      // Remove from cache immediately
      asyncStorageCache.delete(key);
      // Remove from AsyncStorage asynchronously
      AsyncStorage.removeItem(key).catch(console.error);
    }
  },
  subscribe: (
    key: string,
    callback: (value: string | null) => void,
  ): (() => void) => {
    if (useMMKV && mmkv) {
      const listener = (changedKey: string) => {
        if (changedKey === key) callback(storage.getItem(key));
      };
      const { remove } = mmkv.addOnValueChangedListener(listener);
      return () => remove();
    }
    // AsyncStorage doesn't have built-in subscription, return empty unsubscribe
    return () => {};
  },
};

export function createStorage<T>() {
  return createJSONStorage<T>(() => storage);
}
