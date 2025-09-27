import { Gesture } from 'react-native-gesture-handler';
import {
  Extrapolation,
  interpolate,
  runOnJS,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import useOrientation from './useOrientation';

export const usePanGestureHandler = (
  currentPage: number,
  onPageChange: (page: number) => void,
  maxPages: number,
) => {
  const translateX = useSharedValue(0);
  const velocity = useSharedValue(0);
  const { isLandscape } = useOrientation();

  // Enhanced spring configuration for Reanimated 4
  const springConfig = {
    damping: 25,
    stiffness: 120,
    mass: 0.8,
    overshootClamping: false,
    restDisplacementThreshold: 0.01,
    restSpeedThreshold: 0.01,
  };

  const panGestureHandler = Gesture.Pan()
    .onUpdate((e) => {
      // Improved clamping with better physics
      const maxTranslation = isLandscape ? 120 : 100;
      const damping = interpolate(
        Math.abs(e.translationX),
        [0, maxTranslation],
        [1, 0.3],
        Extrapolation.CLAMP,
      );
      translateX.value = e.translationX * damping;
      velocity.value = e.velocityX;
    })
    .onEnd((e) => {
      const threshold = isLandscape ? 150 : 100;
      const velocityThreshold = 300;

      // Enhanced gesture detection with velocity consideration
      const isSwipeBasedOnVelocity =
        Math.abs(velocity.value) > velocityThreshold;
      const swipeDirection = velocity.value > 0 ? 1 : -1;

      let targetPage: number;

      if (isSwipeBasedOnVelocity) {
        // Use velocity for quick swipes
        targetPage =
          swipeDirection > 0
            ? Math.min(currentPage + 1, maxPages)
            : Math.max(currentPage - 1, 1);
      } else {
        // Use distance for slower swipes
        targetPage =
          e.translationX > threshold
            ? Math.min(currentPage + 1, maxPages)
            : e.translationX < -threshold
              ? Math.max(currentPage - 1, 1)
              : currentPage;
      }

      // Only change the page if it differs from the current one
      if (targetPage !== currentPage) {
        runOnJS(onPageChange)(targetPage);
      }

      // Enhanced spring animation with improved physics
      translateX.value = withSpring(0, springConfig);
      velocity.value = withSpring(0, springConfig);
    });

  return { translateX, panGestureHandler };
};
