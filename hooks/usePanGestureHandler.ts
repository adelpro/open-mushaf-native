import { Gesture } from 'react-native-gesture-handler';
import { runOnJS, useSharedValue, withSpring } from 'react-native-reanimated';

export const usePanGestureHandler = (
  currentPage: number,
  onPageChange: (page: number) => void,
  maxPages: number,
) => {
  const translateX = useSharedValue(0);

  const panGestureHandler = Gesture.Pan()
    .onUpdate((e) => {
      translateX.value = Math.max(-100, Math.min(100, e.translationX));
    })
    .onEnd((e) => {
      'worklet'; // Ensuring this block runs on the UI thread
      const threshold = 30;
      if (e.translationX > threshold) {
        // Swipe Right - Go to the next page
        runOnJS(onPageChange)(Math.min(currentPage + 1, maxPages));
      } else if (e.translationX < -threshold) {
        // Swipe Left - Go to the previous page
        runOnJS(onPageChange)(Math.max(currentPage - 1, 1));
      }

      translateX.value = withSpring(0, { damping: 20, stiffness: 90 }); // Smooth return
    });

  return { translateX, panGestureHandler };
};
