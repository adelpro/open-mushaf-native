/**
 * Hex → rgba helper for translucent surfaces from theme tokens.
 *
 * Used by TopMenu and other themed UI when building bar/icon backgrounds
 * and border colors from `#RRGGBB` palette values.
 */

/** Convert `#RRGGBB` to `rgba(...)` for translucent surfaces. */
export function withAlpha(hex: string, alpha: number): string {
  const clean = hex.replace('#', '');
  if (clean.length !== 6) {
    return hex;
  }
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
