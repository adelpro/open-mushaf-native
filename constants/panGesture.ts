// These constants define the behavior and thresholds for swipe gestures across the app.

export const PAN_GESTURE_CONFIG = {
  // Fraction of screen width required to trigger a page change in portrait mode.
  // Expressed as a ratio so the gesture feels the same on small and large screens.
  PORTRAIT_THRESHOLD_RATIO: 0.2,

  // Fraction of screen width required to trigger a page change in landscape mode.
  LANDSCAPE_THRESHOLD_RATIO: 0.18,

  // Clamp the computed threshold so unusually tiny or huge screens stay usable.
  MIN_THRESHOLD: 60,
  MAX_THRESHOLD: 220,

  // Maximum allowed translation out-of-bounds visual effect in MushafPage (clamped limit)
  MAX_TRANSLATION_X: 20,

  // Spring animation damping and stiffness for smooth return to rest state
  SPRING_DAMPING: 20,
  SPRING_STIFFNESS: 90,

  // Force activation of pan when X travels past these bounds
  ACTIVATION_OFFSET_X: [-10, 10] as [number, number],

  // Fail horizontal pan if Y travels past these bounds
  FAIL_OFFSET_Y: [-20, 20] as [number, number],
};

/**
 * Computes the swipe distance (in px) required to trigger a page change.
 * The threshold scales with the screen width so small devices don't require a
 * disproportionately long swipe, and is clamped to a sane range.
 *
 * @param screenWidth - Current window width from `useWindowDimensions`.
 * @param isLandscape - Whether the device is currently in landscape orientation.
 * @returns The base threshold in px, before the user's sensitivity multiplier.
 */
export const getPanThreshold = (screenWidth: number, isLandscape: boolean) => {
  const ratio = isLandscape
    ? PAN_GESTURE_CONFIG.LANDSCAPE_THRESHOLD_RATIO
    : PAN_GESTURE_CONFIG.PORTRAIT_THRESHOLD_RATIO;

  return Math.min(
    PAN_GESTURE_CONFIG.MAX_THRESHOLD,
    Math.max(PAN_GESTURE_CONFIG.MIN_THRESHOLD, screenWidth * ratio),
  );
};
