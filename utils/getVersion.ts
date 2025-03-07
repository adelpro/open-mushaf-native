import { Platform } from 'react-native';

import * as Application from 'expo-application';
import Constants from 'expo-constants';

export const getAppVersion = (): string => {
  if (Platform.OS === 'web') {
    return Constants.expoConfig?.version ?? '1.0.0';
  }

  return (
    Application.nativeApplicationVersion ??
    Constants.expoConfig?.version ??
    '1.0.0'
  );
};
