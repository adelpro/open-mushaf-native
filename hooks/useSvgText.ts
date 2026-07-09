import { useEffect, useMemo, useState } from 'react';
import { Platform, useColorScheme } from 'react-native';

import { Directory, File, Paths } from 'expo-file-system';

import { quranSvgPageUrl } from '@/constants/svgCdn';
import { Riwaya } from '@/types';

import { useQuranMetadata } from './useQuranMetadata';

/**
 * The upstream quranpedia/quran-svg XML hardcodes a small set of fill
 * colors for every text and ornament path. Five of the six qiraaat
 * use `#231f20` (near-black); the Libya Awqaf (Qalon) mushaf uses
 * `#b8924e` (a gold/brown ornament). The page background in light
 * mode is ivory/white, so the originals work fine. In dark mode the
 * container switches to `rgba(26, 26, 26, ...)` which makes the SVG
 * text invisible. Swapping both fills to an off-white in dark mode
 * restores legibility without re-fetching the (large) SVG from the
 * CDN — the transform runs on the cached XML in memory.
 */
const SVG_TEXT_FILL_DARK_FROM = ['#231f20', '#b8924e'];
const SVG_TEXT_FILL_DARK = '#f0ebe5';

/**
 * Reads the raw SVG XML text for a single mushaf page from the local
 * FS cache. The cache is populated by `useMushafDownload` —
 * Hafs and Warsh are auto-downloaded on first launch; the other four
 * qiraat are downloaded on demand.
 *
 * Cache layout (relative to `Paths.document`):
 *   mushaf/<riwaya>/<page>.svg
 *   mushaf/<riwaya>/<page>.json
 *
 * Returns `{ text, viewBox, isLoading, error }`.
 *
 * For multi-surah pages (e.g. Hafs page 106 hosts both surah 4 and
 * surah 5), pass `activeSurah` so we pick the variant
 * (`106-surah4.svg` vs `106-surah5.svg`). Falls back to the default
 * page SVG if the variant isn't found in the cache.
 */
export function useSvgText(args: {
  riwaya: Riwaya;
  page: number;
  activeSurah?: number;
}): {
  text: string | null;
  viewBox: {
    minX: number;
    minY: number;
    width: number;
    height: number;
  } | null;
  isLoading: boolean;
  error: string | null;
} {
  const { riwaya, page, activeSurah } = args;
  const [rawText, setRawText] = useState<string | null>(null);
  const [viewBox, setViewBox] = useState<{
    minX: number;
    minY: number;
    width: number;
    height: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const colorScheme = useColorScheme();
  const { specsData } = useQuranMetadata();
  const { defaultNumberOfPages = 604 } = specsData ?? {};

  // Recolor the cached XML in memory based on the current color scheme.
  // Keyed on rawText + colorScheme so toggling dark mode doesn't re-fetch.
  const text = useMemo(() => {
    if (!rawText) return null;
    if (colorScheme !== 'dark') return fixAyahPolygonOpacity(rawText);
    let recolored = rawText;
    for (const fill of SVG_TEXT_FILL_DARK_FROM) {
      recolored = recolored.replaceAll(fill, SVG_TEXT_FILL_DARK);
    }
    return fixAyahPolygonOpacity(recolored);
  }, [rawText, colorScheme]);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);
    setRawText(null);
    setViewBox(null);

    const load = async () => {
      try {
        if (page < 1 || page > defaultNumberOfPages) {
          throw new Error(
            `Page ${page} out of range 1..${defaultNumberOfPages}`,
          );
        }
        let xml: string;
        // Only the surah-scoped variant gets the multi-surah fallback dance —
        // when no `activeSurah` is requested we just load the default page.
        const variantSuffix =
          activeSurah != null ? `-surah${activeSurah}.svg` : null;
        if (Platform.OS === 'web') {
          // `expo-file-system` v57+ Directory/File/Paths is Android/iOS/tvOS only
          // (no documented web fallback). On web, skip the local FS cache and
          // fetch the SVG straight from the pinned CDN defined in svgCdn.ts.
          const defaultUrl = quranSvgPageUrl(riwaya, page);
          const variantUrl =
            variantSuffix == null
              ? null
              : defaultUrl.replace(/\.svg$/, variantSuffix);
          const primaryUrl = variantUrl ?? defaultUrl;
          try {
            const res = await fetch(primaryUrl);
            if (!res.ok) {
              throw new Error(`HTTP ${res.status} fetching ${primaryUrl}`);
            }
            xml = stripAyahNamespace(await res.text());
          } catch (e) {
            if (variantUrl != null) {
              // Multi-surah variant missing — fall back to the default page SVG.
              const fallback = await fetch(defaultUrl);
              if (!fallback.ok) {
                throw new Error(
                  `HTTP ${fallback.status} fetching ${defaultUrl}`,
                );
              }
              xml = stripAyahNamespace(await fallback.text());
            } else {
              throw e;
            }
          }
        } else {
          const dir = new Directory(Paths.document, 'mushaf', riwaya);
          const padded = String(page).padStart(3, '0');
          const primaryPath = `${padded}${variantSuffix ?? '.svg'}`;

          try {
            xml = await new File(dir, primaryPath).text();
          } catch (e) {
            if (variantSuffix != null) {
              // Multi-surah variant missing — fall back to the default page SVG.
              xml = await new File(dir, `${padded}.svg`).text();
            } else {
              throw e;
            }
          }
        }

        if (cancelled) return;
        setRawText(xml);
        setViewBox(extractViewBox(xml));
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : String(err));
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [riwaya, page, activeSurah, defaultNumberOfPages]);

  return { text, viewBox, isLoading, error };
}

function extractViewBox(xml: string): {
  minX: number;
  minY: number;
  width: number;
  height: number;
} | null {
  const m = xml.match(/<svg\b[^>]*\bviewBox\s*=\s*"([^"]+)"/i);
  if (!m) return null;
  const parts = m[1]
    .trim()
    .split(/[\s,]+/)
    .filter(Boolean)
    .map(Number);
  if (parts.length !== 4 || parts.some((n) => !Number.isFinite(n))) return null;
  const [minX, minY, width, height] = parts as [number, number, number, number];
  return { minX, minY, width, height };
}

/**
 * The upstream quranpedia/quran-svg XML uses a custom `xmlns:ayah`
 * namespace for per-element medallion metadata (`ayah:x`, `ayah:y`).
 * We already get the same coordinates from the per-page polygon JSON,
 * so the namespace is redundant. Worse, on web `react-native-svg`
 * passes every attribute through to the DOM, where React 19 rejects
 * the resulting camelCased props (`ayahX`, `ayahY`, `xmlnsAyah`) as
 * unknown DOM attributes and floods the console with warnings. Strip
 * both the namespace declaration and the namespaced attributes before
 * handing the SVG to the renderer.
 */
function stripAyahNamespace(svgXml: string): string {
  return svgXml
    .replace(/\s+xmlns:ayah="[^"]*"/g, '')
    .replace(/\s+ayah:[a-zA-Z][a-zA-Z0-9-]*="[^"]*"/g, '');
}

export function fixAyahPolygonOpacity(svgString: string): string {
  // Add fill-opacity="0" to all ayahPolygon paths that don't already have it
  // We'll use a regex to find <path class="ayahPolygon" ...> and insert fill-opacity="0" after the class
  // But we need to be careful to not duplicate if it exists.
  // A simple approach: replace all occurrences of `<path class="ayahPolygon"` with `<path class="ayahPolygon" fill-opacity="0"`
  const svg = svgString.replace(
    /<path class="ayahPolygon"/g,
    '<path class="ayahPolygon" fill-opacity="0"',
  );
  return svg;
}
