import { Gesture } from 'react-native-gesture-handler';
import { runOnJS, useSharedValue, withSpring } from 'react-native-reanimated';

import {
  LANDSCAPE_THRESHOLD_RATIO,
  MAX_DRAG_TRANSLATION,
  SPRING_DAMPING,
  SPRING_STIFFNESS,
} from '@/constants';

import useOrientation from './useOrientation';

export const usePanGestureHandler = (
  currentPage: number,
  onPageChange: (page: number) => void,
  maxPages: number,
  /** Portrait swipe threshold in px. Landscape is derived automatically. */
  swipeThreshold = 100,
) => {
  const translateX = useSharedValue(0);
  const { isLandscape } = useOrientation();

  const panGestureHandler = Gesture.Pan()
    .onUpdate((e) => {
      // Clamp visible drag to MAX_DRAG_TRANSLATION in either direction
      translateX.value = Math.max(
        -MAX_DRAG_TRANSLATION,
        Math.min(MAX_DRAG_TRANSLATION, e.translationX),
      );
    })
    .onEnd((e) => {
      // Landscape screens require a proportionally wider swipe
      const threshold = isLandscape
        ? swipeThreshold * LANDSCAPE_THRESHOLD_RATIO
        : swipeThreshold;

      const targetPage =
        e.translationX > threshold
          ? Math.min(currentPage + 1, maxPages) // Swipe Right
          : e.translationX < -threshold
            ? Math.max(currentPage - 1, 1) // Swipe Left
            : currentPage; // No page change

      // Only change the page if it differs from the current one
      if (targetPage !== currentPage) {
        runOnJS(onPageChange)(targetPage);
      }

      // Smooth snap-back to resting position
      translateX.value = withSpring(0, {
        damping: SPRING_DAMPING,
        stiffness: SPRING_STIFFNESS,
      });
    });

  return { translateX, panGestureHandler };
};
