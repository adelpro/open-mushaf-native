/**
 * Parse the per-page polygon string from quranpedia/quran-svg `<page>.json`
 * into a shape that react-native-svg `<Polygon points=... />` accepts.
 *
 * Source format (a string of space-separated "x,y" pairs):
 *   "181.08,18.31 57.54,18.31 57.54,48.94 181.08,48.94"
 *
 * Some entries have double spaces and other whitespace oddities
 * ("56.04,103.24  8.09,103.24 ..."), so we split on `/[\s,]+/`.
 *
 * The returned array is the points attribute directly, e.g.
 *   "181.08,18.31 57.54,18.31 ..."
 *
 * Or we expose `parsePolygonPoints` returning `[[x,y], ...]` if you need
 * to do geometry work (e.g. bounds-checking, hit-testing) on the
 * individual vertices.
 */

const SPLIT_RE = /[\s,]+/;

export type Point = readonly [number, number];

export function parsePolygonPoints(raw: string): Point[] {
  const tokens = raw.trim().split(SPLIT_RE).filter(Boolean);
  const points: Point[] = [];
  for (let i = 0; i + 1 < tokens.length; i += 2) {
    const x = Number.parseFloat(tokens[i]);
    const y = Number.parseFloat(tokens[i + 1]);
    if (Number.isFinite(x) && Number.isFinite(y)) {
      points.push([x, y] as const);
    }
  }
  return points;
}

/**
 * Return the points as a string suitable for `<Polygon points="..." />`.
 * We round-trip through `parsePolygonPoints` to normalize whitespace
 * and drop malformed pairs.
 */
export function polygonPointsString(raw: string): string {
  return parsePolygonPoints(raw)
    .map(([x, y]) => `${x},${y}`)
    .join(' ');
}

/** Compute the axis-aligned bounding box of a polygon. Useful for layouts. */
export function polygonBounds(points: Point[]): {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
} {
  if (points.length === 0) {
    return { minX: 0, minY: 0, maxX: 0, maxY: 0 };
  }
  let minX = Number.POSITIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;
  for (const [x, y] of points) {
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  }
  return { minX, minY, maxX, maxY };
}

/**
 * Standard ray-casting point-in-polygon test. Returns true if the point
 * `(x, y)` is strictly inside the polygon (boundary counts as outside).
 * Used to hit-test touch coordinates against an ayah polygon from the
 * upstream per-page JSON.
 */
export function pointInPolygon(point: Point, polygon: Point[]): boolean {
  if (polygon.length < 3) return false;
  const [x, y] = point;
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i];
    const [xj, yj] = polygon[j];
    const intersects =
      yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersects) inside = !inside;
  }
  return inside;
}

/** Extract the viewBox dimensions from the SVG XML string's `<svg viewBox=...>`. */
export function extractSvgViewBox(
  svgXml: string,
): { minX: number; minY: number; width: number; height: number } | null {
  const m = svgXml.match(/<svg\b[^>]*\bviewBox\s*=\s*"([^"]+)"/i);
  if (!m) return null;
  const parts = m[1].trim().split(SPLIT_RE).filter(Boolean).map(Number);
  if (parts.length !== 4 || parts.some((n) => !Number.isFinite(n))) {
    return null;
  }
  const [minX, minY, width, height] = parts as [number, number, number, number];
  return { minX, minY, width, height };
}

/**
 * Extract ayah hit‑regions DIRECTLY from the SVG’s embedded
 * `<path class="ayahPolygon" surah=... ayah=... d=... />` elements.
 *
 * This bypasses the broken per‑page JSON files (which have `surahNumber: 0,
 * ayahNumber: 0` on most pages). The SVG itself carries the authoritative,
 * correctly‑attributed data, exactly like the `warsh‑digital‑mushaf` reference
 * app does via DOM queries.
 */
export function parseAyahPolygonsFromSvg(svgXml: string): {
  surahNumber: number;
  ayahNumber: number;
  polygon: string;
}[] {
  const results: {
    surahNumber: number;
    ayahNumber: number;
    polygon: string;
  }[] = [];
  const pathTagRe = /<path\b[^>]*class="ayahPolygon"[^>]*\/?>/g;
  let match: RegExpExecArray | null;
  while ((match = pathTagRe.exec(svgXml))) {
    const tag = match[0];
    const surahAttr = tag.match(/\bsurah="(\d+)"/);
    const ayahAttr = tag.match(/\bayah="(\d+)"/);
    const dAttr = tag.match(/\bd="([^"]*)"/);
    if (surahAttr && ayahAttr && dAttr) {
      results.push({
        surahNumber: Number(surahAttr[1]),
        ayahNumber: Number(ayahAttr[1]),
        polygon: dAttr[1],
      });
    }
  }
  return results;
}
