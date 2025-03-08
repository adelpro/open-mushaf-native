import * as Application from 'expo-application';
import Constants from 'expo-constants';

export const getAppVersion = (): string => {
  return (
    Constants.expoConfig?.version ??
    Application.nativeApplicationVersion ??
    '1.0.0'
  );
};
