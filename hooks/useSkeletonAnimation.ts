import { useEffect } from 'react';

import {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

/**
 * Hook providing a looped opacity animation style for skeleton loaders.
 * Uses Reanimated to smoothly pulse between 0.4 and 0.8 opacity.
 *
 * @returns A reanimated style object ready to be applied to an Animated.View.
 */
export function useSkeletonAnimation() {
  const opacity = useSharedValue(0.4);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.8, { duration: 800 }),
        withTiming(0.4, { duration: 800 }),
      ),
      -1,
      true,
    );
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return animatedStyle;
}
