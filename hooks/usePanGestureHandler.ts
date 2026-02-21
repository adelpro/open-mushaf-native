import { Gesture } from 'react-native-gesture-handler';
import { runOnJS, useSharedValue, withSpring } from 'react-native-reanimated';

import useOrientation from './useOrientation';

// Default gesture threshold constants
// These define the minimum swipe distance (in pixels) needed to trigger a page change

// Maximum translation allowed during pan gesture (prevents excessive visual feedback)
const MAX_TRANSLATION = 100;

// Spring animation configuration for smooth return to original position
const SPRING_DAMPING = 20; // Controls how quickly the animation settles
const SPRING_STIFFNESS = 90; // Controls the spring tension

type GestureConfig = {
  // Minimum swipe distance for portrait orientation
  thresholdPortrait?: number;
  // Minimum swipe distance for landscape orientation
  thresholdLandscape?: number;
};

export const usePanGestureHandler = (
  currentPage: number,
  onPageChange: (page: number) => void,
  maxPages: number,
  config?: GestureConfig,
) => {
  const translateX = useSharedValue(0);
  const { isLandscape } = useOrientation();

  // Use configurable thresholds or defaults
  // Landscape typically needs higher threshold due to larger screen width
  const thresholdPortrait = config?.thresholdPortrait ?? 100;
  const thresholdLandscape = config?.thresholdLandscape ?? 150;

  const panGestureHandler = Gesture.Pan()
    .onUpdate((e) => {
      // Limit translation to MAX_TRANSLATION in both directions to prevent excessive visual feedback
      translateX.value = Math.max(
        -MAX_TRANSLATION,
        Math.min(MAX_TRANSLATION, e.translationX),
      );
    })
    .onEnd((e) => {
      // Select appropriate threshold based on device orientation
      const threshold = isLandscape ? thresholdLandscape : thresholdPortrait;

      // Determine target page based on swipe direction and threshold
      const targetPage =
        e.translationX < -threshold
          ? Math.min(currentPage + 1, maxPages) // Swipe Left - Next page (RTL)
          : e.translationX > threshold
            ? Math.max(currentPage - 1, 1) // Swipe Right - Previous page (RTL)
            : currentPage; // No page change - threshold not met

      // Only change the page if it differs from the current one
      if (targetPage !== currentPage) {
        runOnJS(onPageChange)(targetPage);
      }

      // Animate return to original position with spring physics
      translateX.value = withSpring(0, {
        damping: SPRING_DAMPING,
        stiffness: SPRING_STIFFNESS,
      });
    });

  return { translateX, panGestureHandler };
};
