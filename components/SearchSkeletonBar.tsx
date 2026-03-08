import React from 'react';
import { ViewStyle } from 'react-native';

import Animated, { AnimatedStyle } from 'react-native-reanimated';

interface SkeletonBarProps {
  width: number | `${number}%`;
  height: number;
  color: string;
  animatedStyle: AnimatedStyle<ViewStyle>;
}

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
