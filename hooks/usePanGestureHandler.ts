import { useMemo } from 'react';

import { Gesture } from 'react-native-gesture-handler';
import { runOnJS, useSharedValue, withSpring } from 'react-native-reanimated';

import { PAN_GESTURE_CONFIG } from '@/constants';

import { useOrientation } from './useOrientation';

export const usePanGestureHandler = (
  onPageChange: (delta: number) => void,
  sensitivityMultiplier: number = 1.0,
) => {
  const translateX = useSharedValue(0);
  const { isLandscape } = useOrientation();

  const panGestureHandler = useMemo(() => {
    return Gesture.Pan()
      .activeOffsetX(PAN_GESTURE_CONFIG.ACTIVATION_OFFSET_X)
      .failOffsetY(PAN_GESTURE_CONFIG.FAIL_OFFSET_Y)
      .onUpdate((e) => {
        translateX.value = Math.max(
          -PAN_GESTURE_CONFIG.MAX_TRANSLATION_X,
          Math.min(PAN_GESTURE_CONFIG.MAX_TRANSLATION_X, e.translationX),
        );
      })
      .onEnd((e) => {
        const baseThreshold = isLandscape
          ? PAN_GESTURE_CONFIG.LANDSCAPE_THRESHOLD
          : PAN_GESTURE_CONFIG.PORTRAIT_THRESHOLD;

        const threshold = baseThreshold / sensitivityMultiplier;

        if (Math.abs(e.translationX) > threshold) {
          const d = e.translationX > 0 ? 1 : -1;
          runOnJS(onPageChange)(d);
        }

        translateX.value = withSpring(0, {
          damping: PAN_GESTURE_CONFIG.SPRING_DAMPING,
          stiffness: PAN_GESTURE_CONFIG.SPRING_STIFFNESS,
        }); // Smooth return
      });
  }, [isLandscape, onPageChange, sensitivityMultiplier, translateX]);

  return { translateX, panGestureHandler };
};
