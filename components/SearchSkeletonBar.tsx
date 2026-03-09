import React from 'react';
import { ViewStyle } from 'react-native';

import Animated, { AnimatedStyle } from 'react-native-reanimated';

/**
 * Drawing properties enforcing the dimensions and opacity animations
 * bounding an individual skeleton mock line.
 */
interface SkeletonBarProps {
  /** Responsive block width parsing percentage lengths or static bounds. */
  width: number | `${number}%`;
  /** Element rendering thickness parameter. */
  height: number;
  /** Color mask block fill reference. */
  color: string;
  /** Emitted hook payload tying into Reanimated interpolation tracking. */
  animatedStyle: AnimatedStyle<ViewStyle>;
}

/**
 * A generalized block container generating pulsing opacity visuals tied to Reanimated parameters.
 * Used composably inside Loading/Fallback structures.
 *
 * @param props - Bounding configuration mapped via the parent fallback layout.
 * @returns An `Animated.View` mock layer.
 */
export function SkeletonBar({
  width,
  height,
  color,
  animatedStyle,
}: SkeletonBarProps) {
  return (
    <Animated.View
      style={[
        { width, height, borderRadius: 4, backgroundColor: color },
        animatedStyle,
      ]}
    />
  );
}
