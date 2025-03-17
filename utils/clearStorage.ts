import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Updates from 'expo-updates';

export async function clearStorageAndReload() {
  try {
    await AsyncStorage.clear();
    console.log('Storage cleared!');

    await Updates.reloadAsync();
    console.log('Application Reloaded!');
  } catch (error) {
    console.error('Failed to clear storage', error);
  }
}
