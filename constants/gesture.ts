/**
 * Gesture-related constants for pan/swipe interactions.
 *
 * These values control how the app responds to horizontal swipe gestures
 * used for page navigation in the Mushaf reader and tutorial screens.
 */

// ── Swipe threshold (px) ──────────────────────────────────────────────
// Minimum horizontal distance the finger must travel before a page
// change is triggered.  Landscape values are higher because the wider
// viewport makes accidental horizontal swipes more likely.

/** Portrait swipe threshold in pixels. */
export const SWIPE_THRESHOLD_PORTRAIT = 100;

/** Landscape swipe threshold — higher to avoid accidental page turns. */
export const SWIPE_THRESHOLD_LANDSCAPE = 150;

// ── Sensitivity presets ───────────────────────────────────────────────
// Multipliers applied to the base thresholds above.  A lower multiplier
// makes the gesture easier to trigger (more sensitive).

export const SENSITIVITY_MULTIPLIERS = [0.6, 1.0, 1.4] as const;
export const SENSITIVITY_LABELS = ['حساس', 'متوسط', 'ثابت'];
export const SENSITIVITY_DEFAULT_INDEX = 1;

// ── Visual feedback ───────────────────────────────────────────────────
// Control how much the page visually shifts, dims, and shadows while
// the user is mid-swipe (before releasing).

/** Maximum horizontal drag the page image can visually translate (px). */
export const MAX_VISUAL_TRANSLATE_X = 20;

/** Maximum shadow opacity applied during a swipe (0–1). */
export const MAX_SWIPE_SHADOW_OPACITY = 0.5;

/** Minimum page opacity at the peak of a swipe drag (0–1). */
export const MIN_SWIPE_PAGE_OPACITY = 0.85;

/** Clamp range for the raw translation value during onUpdate (px). */
export const TRANSLATION_CLAMP = 100;

// ── Spring animation ──────────────────────────────────────────────────
// Parameters for the spring that snaps the page back to x=0 after the
// gesture ends.

/** Damping — higher = less oscillation. */
export const SPRING_DAMPING = 20;

/** Stiffness — higher = faster snap-back. */
export const SPRING_STIFFNESS = 90;

// ── Tutorial slide animation ──────────────────────────────────────────

/** Duration (ms) of the fade-in / fade-out transition between slides. */
export const SLIDE_TRANSITION_DURATION = 500;
