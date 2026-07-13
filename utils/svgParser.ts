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

export type Point = readonly [number, number];

/**
 * Parse an SVG path `d` string (absolute commands M, L, Z)
 * into an array of [x, y] points.
 */
export function parsePathToPoints(d: string): Point[] {
  const cleaned = d.replace(/[MLZ]/gi, ' ').trim();
  const nums = cleaned
    .split(/[\s,]+/)
    .filter(Boolean)
    .map(parseFloat);
  const points: Point[] = [];
  for (let i = 0; i + 1 < nums.length; i += 2) {
    const x = nums[i];
    const y = nums[i + 1];
    if (!isNaN(x) && !isNaN(y)) {
      points.push([x, y]);
    }
  }
  return points;
}

/**
 * Standard ray-casting point-in-polygon test.
 * Returns true if point (x, y) is strictly inside the polygon.
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
