/**
 * Pure helpers used by `widgets/android.tsx`. Extracted into a separate
 * module so they can be unit-tested without rendering the React Native
 * widget tree (which requires native modules and runtime mocks).
 *
 * `surahToIconChar` and `buildRingSvg` are pixel/layout logic with no
 * React dependencies; `layoutFor` picks a size preset from the host's
 * reported widget dimensions.
 */

import type { HexColor } from 'react-native-android-widget';

export type LayoutPreset = {
  ringSize: number;
  ringRadius: number;
  ringStroke: number;
  ringFontSize: number;
  surahGlyphSize: number;
  headerFontSize: number;
  bodyFontSize: number;
  showSurahGlyph: boolean;
};

/**
 * Maps the host-provided widget size to a layout preset. Thresholds are
 * tuned for the provider XML (`minWidth=320dp`, `minHeight=120dp`,
 * `resizeMode=horizontal`):
 *
 * - compact: very small (height < 100dp). Hides the surah glyph and
 *   uses a smaller ring/text. Rare in production since the host
 *   enforces `minHeight=120dp`.
 * - normal:  default size (height 100..399dp, any width). The
 *   historical layout.
 * - wide:    horizontally resized to ≥ 400dp. Bigger ring, glyph, and
 *   text.
 */
export function layoutFor(width?: number, height?: number): LayoutPreset {
  const compact = height !== undefined && height > 0 && height < 100;
  const wide = (width ?? 0) >= 400;

  if (compact) {
    return {
      ringSize: 80,
      ringRadius: 30,
      ringStroke: 5,
      ringFontSize: 14,
      surahGlyphSize: 0, // hidden in compact
      headerFontSize: 18,
      bodyFontSize: 14,
      showSurahGlyph: false,
    };
  }

  if (wide) {
    return {
      ringSize: 140,
      ringRadius: 32,
      ringStroke: 6,
      ringFontSize: 20,
      surahGlyphSize: 80,
      headerFontSize: 24,
      bodyFontSize: 20,
      showSurahGlyph: true,
    };
  }

  return {
    ringSize: 120,
    ringRadius: 28,
    ringStroke: 5,
    ringFontSize: 18,
    surahGlyphSize: 60,
    headerFontSize: 22,
    bodyFontSize: 18,
    showSurahGlyph: true,
  };
}

/**
 * Converts a 1..114 surah number into the private-use-area codepoint
 * the bundled `open_mushaf_icons.ttf` font uses for its glyph.
 */
export function surahToIconChar(surahNumber: number): string {
  // 1. Convert surahNumber (e.g., 38) to a hex string ("38")
  // 2. Parse that string as a hex value (0x38)
  // 3. Add to base 0xe000
  const hexOffset = parseInt(surahNumber.toString(), 16);
  return String.fromCharCode(0xe000 + hexOffset);
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function withHexAlpha(hex: HexColor, alphaHex: string): HexColor {
  const normalized = hex.trim() as HexColor;
  const base =
    normalized.length === 9 ? (normalized.slice(0, 7) as HexColor) : normalized;
  return `${base}${alphaHex}` as HexColor;
}

/**
 * Builds the progress-ring SVG. The size parameter is the outer viewBox
 * width/height; the ring itself is centered in a `radius`-radius circle
 * with a `strokeWidth` stroke. The label sits inside the ring.
 */
export function buildRingSvg(params: {
  radius: number;
  strokeWidth: number;
  progress: number;
  trackColor: string;
  progressColor: string;
  label: string;
  viewBox: number;
  fontSize: number;
}): string {
  const {
    radius,
    strokeWidth,
    progress,
    trackColor,
    progressColor,
    label,
    viewBox,
    fontSize,
  } = params;

  const cx = viewBox / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return `
    <svg width="${viewBox}" height="${viewBox}" viewBox="0 0 ${viewBox} ${viewBox}">
      <circle
        cx="${cx}"
        cy="${cx}"
        r="${radius}"
        stroke="${trackColor}"
        stroke-width="${strokeWidth}"
        fill="none"
      />
      <circle
        cx="${cx}"
        cy="${cx}"
        r="${radius}"
        stroke="${progressColor}"
        stroke-width="${strokeWidth}"
        stroke-dasharray="${circumference}"
        stroke-dashoffset="${strokeDashoffset}"
        stroke-linecap="round"
        fill="none"
      />
      <text
        x="${cx}"
        y="${cx + fontSize / 3}"
        text-anchor="middle"
        dominant-baseline="middle"
        direction="rtl"
        fill="${progressColor}"
        font-size="${fontSize}"
        font-weight="700"
        font-family="sans-serif"
      >${label}</text>
    </svg>
  `;
}
