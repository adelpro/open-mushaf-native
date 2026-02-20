/**
 * Gesture handler constants for swipe page navigation.
 *
 * SWIPE_THRESHOLD_PORTRAIT / SWIPE_THRESHOLD_LANDSCAPE:
 *   Minimum horizontal translation (px) the user must drag before a
 *   page turn is triggered. Landscape requires a wider swipe because
 *   the screen is wider, preventing accidental turns.
 *
 * MAX_DRAG_TRANSLATION:
 *   Clamps the visible drag distance so the page preview never slides
 *   further than this many pixels from its resting position.
 *
 * SPRING_DAMPING / SPRING_STIFFNESS:
 *   Control the "snap back" animation after a swipe. Higher damping
 *   reduces bounce; higher stiffness makes the return faster.
 */

/** Default swipe threshold in portrait mode (px). */
export const SWIPE_THRESHOLD_PORTRAIT = 100;

/** Default swipe threshold in landscape mode (px). */
export const SWIPE_THRESHOLD_LANDSCAPE = 150;

/** Maximum visual drag displacement (px). */
export const MAX_DRAG_TRANSLATION = 100;

/** Spring animation damping for the snap-back. */
export const SPRING_DAMPING = 20;

/** Spring animation stiffness for the snap-back. */
export const SPRING_STIFFNESS = 90;

/** Ratio of landscape threshold to portrait threshold. */
export const LANDSCAPE_THRESHOLD_RATIO = SWIPE_THRESHOLD_LANDSCAPE / SWIPE_THRESHOLD_PORTRAIT;

/** Minimum configurable swipe sensitivity (px) — very sensitive. */
export const SWIPE_SENSITIVITY_MIN = 50;

/** Maximum configurable swipe sensitivity (px) — very insensitive. */
export const SWIPE_SENSITIVITY_MAX = 200;
