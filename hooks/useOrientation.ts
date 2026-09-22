import { useWindowDimensions } from 'react-native';

/**
 * Hook to detect the current orientation and available size of the device interface.
 * Evaluates whether the screen's width is greater than its height.
 *
 * @returns An object containing `isLandscape`, `width` and `height` flags.
 */
export function useOrientation() {
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  return { isLandscape, width, height };
}
