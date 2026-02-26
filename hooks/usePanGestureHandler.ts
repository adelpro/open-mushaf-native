import { Gesture } from 'react-native-gesture-handler';
import { runOnJS, useSharedValue, withSpring } from 'react-native-reanimated';

import useOrientation from './useOrientation';

/**
 * Minimum translation value for the pan gesture (clamps left swipe).
 * @constant {number}
 */
const MIN_TRANSLATION_X = -100;

/**
 * Maximum translation value for the pan gesture (clamps right swipe).
 * @constant {number}
 */
const MAX_TRANSLATION_X = 100;

/**
 * Swipe threshold for portrait mode.
 * User must swipe at least this distance to trigger a page change.
 * @constant {number}
 */
const SWIPE_THRESHOLD_PORTRAIT = 100;

/**
 * Swipe threshold for landscape mode.
 * Higher threshold in landscape to account for different aspect ratio.
 * @constant {number}
 */
const SWIPE_THRESHOLD_LANDSCAPE = 150;

/**
 * Damping value for the spring animation.
 * Controls how much the animation oscillates before settling.
 * @constant {number}
 */
const SPRING_DAMPING = 20;

/**
 * Stiffness value for the spring animation.
 * Controls how quickly the animation reaches its target value.
 * @constant {number}
 */
const SPRING_STIFFNESS = 90;

/**
 * Minimum page number allowed in the Mushaf.
 * @constant {number}
 */
const MIN_PAGE_NUMBER = 1;

/**
 * Custom hook that creates a pan gesture handler for page swiping.
 *
 * @param {number} currentPage - The currently displayed page number.
 * @param {(page: number) => void} onPageChange - Callback fired when a page change is triggered.
 * @param {number} maxPages - The maximum number of pages in the Mushaf.
 * @returns {{ translateX: Animated.SharedValue<number>, panGestureHandler: GestureType }} The translateX value and pan gesture handler.
 *
 * @example
 * const { translateX, panGestureHandler } = usePanGestureHandler(currentPage, handlePageChange, 604);
 */
export const usePanGestureHandler = (
  currentPage: number,
  onPageChange: (page: number) => void,
  maxPages: number,
) => {
  const translateX = useSharedValue(0);
  const { isLandscape } = useOrientation();

  const panGestureHandler = Gesture.Pan()
    .onUpdate((e) => {
      translateX.value = Math.max(
        MIN_TRANSLATION_X,
        Math.min(MAX_TRANSLATION_X, e.translationX),
      );
    })
    .onEnd((e) => {
      const threshold = isLandscape
        ? SWIPE_THRESHOLD_LANDSCAPE
        : SWIPE_THRESHOLD_PORTRAIT;
      const targetPage =
        e.translationX > threshold
          ? Math.min(currentPage + 1, maxPages) // Swipe Right - go to next page
          : e.translationX < -threshold
            ? Math.max(currentPage - 1, MIN_PAGE_NUMBER) // Swipe Left - go to previous page
            : currentPage; // No page change - below threshold

      // Only change the page if it differs from the current one
      if (targetPage !== currentPage) {
        runOnJS(onPageChange)(targetPage);
      }

      translateX.value = withSpring(0, {
        damping: SPRING_DAMPING,
        stiffness: SPRING_STIFFNESS,
      }); // Smooth return to center
    });

  return { translateX, panGestureHandler };
};
