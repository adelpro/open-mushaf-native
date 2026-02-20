import { Gesture } from 'react-native-gesture-handler';
import { runOnJS, useSharedValue, withSpring } from 'react-native-reanimated';

import {
  SPRING_DAMPING,
  SPRING_STIFFNESS,
  SWIPE_THRESHOLD_LANDSCAPE,
  SWIPE_THRESHOLD_PORTRAIT,
  TRANSLATION_CLAMP,
} from '@/constants';

import useOrientation from './useOrientation';

export const usePanGestureHandler = (
  currentPage: number,
  onPageChange: (page: number) => void,
  maxPages: number,
  /** Optional multiplier applied to the base swipe threshold (default 1). */
  sensitivityMultiplier = 1,
) => {
  const translateX = useSharedValue(0);
  const { isLandscape } = useOrientation();

  const panGestureHandler = Gesture.Pan()
    .onUpdate((e) => {
      // Clamp the drag so the page doesn't translate too far visually
      translateX.value = Math.max(
        -TRANSLATION_CLAMP,
        Math.min(TRANSLATION_CLAMP, e.translationX),
      );
    })
    .onEnd((e) => {
      // Choose base threshold depending on orientation, then scale by user preference
      const baseThreshold = isLandscape
        ? SWIPE_THRESHOLD_LANDSCAPE
        : SWIPE_THRESHOLD_PORTRAIT;
      const threshold = baseThreshold * sensitivityMultiplier;

      const targetPage =
        e.translationX > threshold
          ? Math.min(currentPage + 1, maxPages) // Swipe Right
          : e.translationX < -threshold
            ? Math.max(currentPage - 1, 1) // Swipe Left
            : currentPage; // No page change

      if (targetPage !== currentPage) {
        runOnJS(onPageChange)(targetPage);
      }

      // Snap back with a smooth spring animation
      translateX.value = withSpring(0, {
        damping: SPRING_DAMPING,
        stiffness: SPRING_STIFFNESS,
      });
    });

  return { translateX, panGestureHandler };
};
