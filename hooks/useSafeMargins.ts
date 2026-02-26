import { Platform, StatusBar, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * Hook to get platform-specific top margin
 * Fixes issue #80: Hardcoded top margin on iOS
 */
export function useTopMargin() {
  const insets = useSafeAreaInsets();
  
  return Platform.select({
    ios: insets.top, // Use SafeArea insets on iOS
    android: StatusBar.currentHeight || 0, // Use StatusBar height on Android
    default: 0,
  });
}

/**
 * Hook to get platform-specific bottom margin
 */
export function useBottomMargin() {
  const insets = useSafeAreaInsets();
  
  return Platform.select({
    ios: insets.bottom,
    android: 0,
    default: 0,
  });
}

/**
 * Hook to get safe area padding for screens
 */
export function useSafePadding() {
  const insets = useSafeAreaInsets();
  
  return {
    paddingTop: insets.top,
    paddingBottom: insets.bottom,
    paddingLeft: insets.left,
    paddingRight: insets.right,
  };
}

/**
 * Styles for safe area aware containers
 */
export const safeAreaStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  iosContainer: {
    flex: 1,
  },
  androidContainer: {
    flex: 1,
    paddingTop: StatusBar.currentHeight || 0,
  },
});
