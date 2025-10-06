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
export const isCompactView = (width: number): boolean =>
  width < BREAKPOINTS.COMPACT;
export const isMobileView = (width: number): boolean =>
  width < BREAKPOINTS.MOBILE;
export const isTabletView = (width: number): boolean =>
  width < BREAKPOINTS.TABLET;

// Get pagination range based on screen width
export const getPaginationRange = (width: number): number => {
  if (width < BREAKPOINTS.MOBILE) return 1;
  if (width < BREAKPOINTS.TABLET) return 3;
  return 5; // For larger screens, show more page numbers
};
