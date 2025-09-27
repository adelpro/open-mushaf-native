import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Updates from 'expo-updates';

// Try to import MMKV, fallback to AsyncStorage if not available (e.g., in Expo Go)
let mmkv: any = null;
let useMMKV = false;

try {
  const { MMKV } = require('react-native-mmkv');
  mmkv = new MMKV();
  useMMKV = true;
} catch (error) {
  console.log('MMKV not available, will clear AsyncStorage in Expo Go');
  useMMKV = false;
}

export async function clearStorageAndReload() {
  try {
    if (useMMKV && mmkv) {
      mmkv.clearAll();
      console.log('MMKV storage cleared!');
    } else {
      await AsyncStorage.clear();
      console.log('AsyncStorage cleared!');
    }
    await Updates.reloadAsync();
  } catch (error) {
    console.error('Failed to clear storage or reload app', error);
  }
}
