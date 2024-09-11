import { Router } from 'expo-router';
import {
  PanGestureHandlerStateChangeEvent,
  State,
} from 'react-native-gesture-handler';

/**
 * Handles swipe gestures for navigating between pages.
 *
 * @param currentPage - The current page number.
 * @param totalPages - The total number of pages available.
 * @param router - The router instance to handle navigation.
 */
export const handleSwipe =
  (currentPage: number, totalPages: number, router: Router) =>
  (event: PanGestureHandlerStateChangeEvent) => {
    const { translationX, state } = event.nativeEvent;

    // Only handle the swipe when the gesture ends
    if (state === State.END) {
      // Right swipe (previous page)
      if (translationX > 50 && currentPage > 1) {
        const previousPage = currentPage - 1;
        router.push(`/(tabs)?page=${previousPage}`);
      }
      // Left swipe (next page)
      else if (translationX < -50 && currentPage < totalPages) {
        const nextPage = currentPage + 1;
        router.push(`/(tabs)?page=${nextPage}`);
      }
    }
  };
