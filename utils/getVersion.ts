import * as Application from 'expo-application';
import Constants from 'expo-constants';

/**
 * Retrieves the current application version string.
 * Uses expo-constants in dev and expo-application in production.
 *
 * @returns The formatted application version string (e.g., '1.0.0').
 */
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

/**
 * Retrieves the native application build version/number.
 *
 * @returns The build version string (e.g., '123' or '000' as fallback).
 */
export const getBuildVersion = (): string => {
  return Application.nativeBuildVersion ?? '000';
};
