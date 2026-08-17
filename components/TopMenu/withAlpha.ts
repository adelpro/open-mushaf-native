/**
 * Hex → rgba helper for translucent TopMenu surfaces.
 *
 * Used by `components/TopMenu/index.tsx` when building bar/icon backgrounds
 * and border colors from theme tokens.
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
