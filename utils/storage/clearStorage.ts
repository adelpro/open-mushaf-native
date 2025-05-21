import * as Updates from 'expo-updates';
import { MMKV } from 'react-native-mmkv';

const mmkv = new MMKV();

export async function clearStorageAndReload() {
  try {
    mmkv.clearAll();
    console.log('MMKV storage cleared!');
    await Updates.reloadAsync();
  } catch (error) {
    console.error('Failed to clear MMKV storage', error);
  }
}
