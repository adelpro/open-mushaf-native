import { Platform } from 'react-native';

/**
 * Flag indicating if the application is currently running on the web platform.
 */
export const isWeb = Platform.OS === 'web';
