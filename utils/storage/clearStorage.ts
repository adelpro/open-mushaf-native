import * as Updates from 'expo-updates';
import { MMKV } from 'react-native-mmkv';

const mmkv = new MMKV();

/**
 * Clears completely the local MMKV storage and reloads the application.
 * Native platform implementation. (android/iOS)
 *
 * @returns A promise resolving when the app reload is initiated.
 */
export async function clearStorageAndReload() {
  try {
    mmkv.clearAll();
    console.log('MMKV storage cleared!');
    await Updates.reloadAsync();
  } catch (error) {
    console.error('Failed to clear MMKV storage', error);
  }
}
