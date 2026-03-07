// These constants define the behavior and thresholds for swipe gestures across the app.

export const PAN_GESTURE_CONFIG = {
  // Swipe distance threshold required to trigger a page change in portrait mode.
  PORTRAIT_THRESHOLD: 100,

  // Swipe distance threshold required to trigger a page change in landscape mode.
  LANDSCAPE_THRESHOLD: 150,

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
