import * as Application from 'expo-application';
import Constants from 'expo-constants';

export const getAppVersion = (): string => {
  // For development in Expo Go
  if (__DEV__) {
    return Constants.expoConfig?.version ?? '0.0.0';
  }

  // For production builds
  return (
    Application.nativeApplicationVersion ??
    Constants.expoConfig?.version ??
    '0.0.0'
  );
};

export const getBuildVersion = (): string => {
  return Application.nativeBuildVersion ?? '000';
};
