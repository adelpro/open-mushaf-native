import { Gesture } from 'react-native-gesture-handler';
import { runOnJS, useSharedValue, withSpring } from 'react-native-reanimated';

import useOrientation from './useOrientation';

export const usePanGestureHandler = (
  currentPage: number,
  onPageChange: (page: number) => void,
  maxPages: number,
) => {
  const translateX = useSharedValue(0);
  const { isLandscape } = useOrientation();

  const panGestureHandler = Gesture.Pan()
    .onUpdate((e) => {
      translateX.value = Math.max(-100, Math.min(100, e.translationX));
    })
    .onEnd((e) => {
      const threshold = isLandscape ? 150 : 100;
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

      translateX.value = withSpring(0, { damping: 20, stiffness: 90 }); // Smooth return
    });

  return { translateX, panGestureHandler };
};
