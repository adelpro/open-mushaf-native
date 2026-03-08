/**
 * Utility for managing screen dimensions and breakpoints
 */

// Screen size breakpoints
export const BREAKPOINTS = {
  COMPACT: 370, // Very small screens (small phones)
  MOBILE: 640, // Mobile screens
  TABLET: 1024, // Tablet screens
};

// Helper functions to check screen sizes
/**
 * Checks if the given screen width corresponds to a very small screen view.
 *
 * @param width - The screen width in pixels.
 * @returns True if the width is less than the compact breakpoint.
 */
export const isCompactView = (width: number): boolean =>
  width < BREAKPOINTS.COMPACT;

/**
 * Checks if the given screen width corresponds to a mobile screenview.
 *
 * @param width - The screen width in pixels.
 * @returns True if the width is less than the mobile breakpoint.
 */
export const isMobileView = (width: number): boolean =>
  width < BREAKPOINTS.MOBILE;

/**
 * Checks if the given screen width corresponds to a tablet screen view.
 *
 * @param width - The screen width in pixels.
 * @returns True if the width is less than the tablet breakpoint.
 */
export const isTabletView = (width: number): boolean =>
  width < BREAKPOINTS.TABLET;

/**
 * Determines the pagination range to display based on screen width.
 *
 * @param width - The screen width in pixels.
 * @returns The number of pagination elements to show.
 */
export const getPaginationRange = (width: number): number => {
  if (width < BREAKPOINTS.MOBILE) return 1;
  if (width < BREAKPOINTS.TABLET) return 3;
  return 5; // For larger screens, show more page numbers
};
