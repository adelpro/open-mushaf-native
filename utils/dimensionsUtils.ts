/**
 * Utility for managing screen dimensions and responsive breakpoints.
 */

/** Pixel-width thresholds for classifying device screen sizes. */
export const BREAKPOINTS = {
  COMPACT: 370, // Very small screens (small phones)
  MOBILE: 640, // Mobile screens
  TABLET: 1024, // Tablet screens
};

/**
 * Returns `true` when the screen width falls below the compact breakpoint.
 *
 * @param width - Current screen width in logical pixels.
 */
export const isCompactView = (width: number): boolean =>
  width < BREAKPOINTS.COMPACT;

/**
 * Returns `true` when the screen width falls below the mobile breakpoint.
 *
 * @param width - Current screen width in logical pixels.
 */
export const isMobileView = (width: number): boolean =>
  width < BREAKPOINTS.MOBILE;

/**
 * Returns `true` when the screen width falls below the tablet breakpoint.
 *
 * @param width - Current screen width in logical pixels.
 */
export const isTabletView = (width: number): boolean =>
  width < BREAKPOINTS.TABLET;

/**
 * Returns the number of sibling page numbers to display on each side of the
 * current page in the pagination control, based on available screen width.
 *
 * - `< MOBILE` → 1 sibling (tight space)
 * - `< TABLET` → 3 siblings
 * - `≥ TABLET` → 5 siblings (wide layout)
 *
 * @param width - Current screen width in logical pixels.
 * @returns Number of page siblings to show on each side of the active page.
 */
export const getPaginationRange = (width: number): number => {
  if (width < BREAKPOINTS.MOBILE) return 1;
  if (width < BREAKPOINTS.TABLET) return 3;
  return 5;
};
