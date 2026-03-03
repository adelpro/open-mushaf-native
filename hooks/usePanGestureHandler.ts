import { Gesture } from 'react-native-gesture-handler';
import { runOnJS, useSharedValue, withSpring } from 'react-native-reanimated';

import { useOrientation } from './useOrientation';

export const usePanGestureHandler = (onPageChange: (delta: number) => void) => {
  const translateX = useSharedValue(0);
  const { isLandscape } = useOrientation();

  const panGestureHandler = Gesture.Pan()
    .activeOffsetX([-20, 20])
    .failOffsetY([-30, 30])
    .onUpdate((e) => {
      translateX.value = Math.max(-100, Math.min(100, e.translationX));
    })
    .onEnd((e) => {
      const threshold = isLandscape ? 150 : 100;

      let delta = 0;
      if (e.translationX > threshold) {
        delta = 1; // Swipe Right -> Next
      } else if (e.translationX < -threshold) {
        delta = -1; // Swipe Left -> Prev
      }

      // Only change if a swipe was detected
      if (delta !== 0) {
        runOnJS(onPageChange)(delta);
      }

      translateX.value = withSpring(0, { damping: 20, stiffness: 90 }); // Smooth return
    });

  return { translateX, panGestureHandler };
};
