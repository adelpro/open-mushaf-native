// --- NEW: parseAyahPolygonsFromSvg ---
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

export interface ParsedPath {
  d: string;
  class?: string;
  surah?: string;
  ayah?: string;
  id?: string;
  number?: string;
}

export interface ParsedSvg {
  viewBox: { minX: number; minY: number; width: number; height: number };
  paths: ParsedPath[];
}

/**
 * Parse an SVG string and extract all <path> elements and the viewBox.
 * Works entirely with regex – no external libraries needed.
 */
export function parseSvg(svgXml: string): ParsedSvg | null {
  // Extract viewBox
  const viewBoxMatch = svgXml.match(/<svg\b[^>]*\bviewBox\s*=\s*"([^"]+)"/i);
  if (!viewBoxMatch) return null;
  const viewBoxParts = viewBoxMatch[1].trim().split(/\s+/).map(Number);
  if (viewBoxParts.length !== 4 || viewBoxParts.some(isNaN)) return null;
  const [minX, minY, width, height] = viewBoxParts;
  const viewBox = { minX, minY, width, height };

  // Extract all <path> tags, even those nested inside <g>
  const pathRegex = /<path\b([^>]*?)\/?>/gi;
  const paths: ParsedPath[] = [];
  let match: RegExpExecArray | null;
  while ((match = pathRegex.exec(svgXml)) !== null) {
    const attrs = match[1];
    const d = attrs.match(/\bd="([^"]*)"/)?.[1];
    if (!d) continue;
    const cls = attrs.match(/\bclass="([^"]*)"/)?.[1];
    const surah = attrs.match(/\bsurah="([^"]*)"/)?.[1];
    const ayah = attrs.match(/\bayah="([^"]*)"/)?.[1];
    const id = attrs.match(/\bid="([^"]*)"/)?.[1];
    const number = attrs.match(/\bnumber="([^"]*)"/)?.[1];
    paths.push({ d, class: cls, surah, ayah, id, number });
  }

  return { viewBox, paths };
}

// utils/svgPolygon.ts

export type Point = readonly [number, number];

// ... existing functions ...

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
