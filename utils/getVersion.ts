import * as Application from 'expo-application';
import Constants from 'expo-constants';

export const getAppVersion = (): string => {
  return (
    Constants.expoConfig?.version ??
    Application.nativeApplicationVersion ??
    '0.0.0'
  );
};
