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
  errorKind: SvgTextErrorKind | null;
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
  const [errorKind, setErrorKind] = useState<SvgTextErrorKind | null>(null);

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
    setErrorKind(null);
    setRawText(null);
    setViewBox(null);

    const load = async () => {
      try {
        if (page < 1 || page > defaultNumberOfPages) {
          throw new SvgTextError(
            'out-of-range',
            `Page ${page} out of range 1..${defaultNumberOfPages}`,
          );
        }

        // Only the surah-scoped variant gets the multi-surah fallback dance —
        // when no `activeSurah` is requested we just load the default page.
        const variantSuffix =
          activeSurah != null ? `-surah${activeSurah}.svg` : null;
        const defaultUrl = quranSvgPageUrl(riwaya, page);
        const variantUrl =
          variantSuffix == null
            ? null
            : defaultUrl.replace(/\.svg$/, variantSuffix);
        const primaryUrl = variantUrl ?? defaultUrl;

        // Fetch the SVG XML from the pinned CDN. Returns
        // `fetch-failed` if the response is non-2xx; throws (caller
        // catches as `not-cached-offline` when this is on a disk-miss
        // path) on a network error.
        const fetchFromCdn = async (
          url: string,
          throwAsOfflineOnReject: boolean,
        ): Promise<string> => {
          try {
            const res = await fetch(url);
            if (!res.ok) {
              throw new SvgTextError(
                'fetch-failed',
                `HTTP ${res.status} fetching ${url}`,
              );
            }
            return stripAyahNamespace(await res.text());
          } catch (err) {
            if (throwAsOfflineOnReject && err instanceof SvgTextError) {
              // Already classified — let the caller decide if the
              // overall error is `fetch-failed` or `not-cached-offline`.
              throw err;
            }
            if (throwAsOfflineOnReject) {
              throw new SvgTextError(
                'not-cached-offline',
                err instanceof Error ? err.message : String(err),
              );
            }
            throw err;
          }
        };

        let xml!: string;
        if (Platform.OS === 'web') {
          // `expo-file-system` v57+ Directory/File/Paths is Android/iOS/tvOS
          // only (no documented web fallback). On web, skip the local FS
          // cache and fetch the SVG straight from the pinned CDN; the SW's
          // `mushaf-svgs` route (StaleWhileRevalidate, 30 entries / 30 d)
          // covers casual browsing, and `mushaf-download-<riwaya>` (added
          // in Phase 5) holds the explicit offline download.
          try {
            xml = await fetchFromCdn(primaryUrl, false);
          } catch (e) {
            if (variantUrl != null) {
              xml = await fetchFromCdn(defaultUrl, false);
            } else {
              throw e;
            }
          }
        } else {
          // Native: try the local FS cache first. If the page isn't on disk
          // yet (the offline download hasn't run, or pages are still
          // streaming in), fall back to the CDN. The fetched XML is cached
          // in memory by `useMemo` for the lifetime of this component; Phase 2
          // will additionally persist fetched pages to disk so the second
          // read is offline. The cache layout, populated by the upcoming
          // download hooks, is:
          //   Paths.document/mushaf/<riwaya>/<NNN>.svg
          //   Paths.document/mushaf/<riwaya>/<NNN>-surah<S>.svg
          const dir = new Directory(Paths.document, 'mushaf', riwaya);
          const padded = String(page).padStart(3, '0');
          const primaryPath = `${padded}${variantSuffix ?? '.svg'}`;
          const fallbackPath = `${padded}.svg`;

          let fromDisk = false;
          try {
            xml = await new File(dir, primaryPath).text();
            fromDisk = true;
          } catch {
            if (variantSuffix != null) {
              try {
                xml = await new File(dir, fallbackPath).text();
                fromDisk = true;
              } catch {
                // Disk miss on both variants — fall through to network.
              }
            }
          }

          if (!fromDisk) {
            // Disk miss: the network fetch result is *not* from the
            // local cache. If `fetch` rejects (network unreachable,
            // DNS failure, etc.) we want `errorKind: 'not-cached-offline'`
            // so the UI can offer a Download CTA, not a generic
            // fetch-failed error. The throwAsOfflineOnReject flag
            // asks fetchFromCdn to wrap a non-typed throw as
            // not-cached-offline so the consumer gets a usable kind.
            let classified: SvgTextError | null = null;
            try {
              xml = await fetchFromCdn(primaryUrl, true);
            } catch (e) {
              if (e instanceof SvgTextError) {
                classified = e;
              } else {
                classified = new SvgTextError(
                  'not-cached-offline',
                  e instanceof Error ? e.message : String(e),
                );
              }
              if (variantUrl != null) {
                try {
                  xml = await fetchFromCdn(defaultUrl, true);
                  classified = null;
                } catch (e2) {
                  if (e2 instanceof SvgTextError) {
                    classified = e2;
                  } else {
                    classified = new SvgTextError(
                      'not-cached-offline',
                      e2 instanceof Error ? e2.message : String(e2),
                    );
                  }
                }
              }
            }
            if (classified) throw classified;
            // Phase 2: persist the page we just fetched so the second
            // read is offline. Best-effort — a write failure must NOT
            // fail the in-memory render, otherwise online reading
            // regresses when the disk is full. We only persist the
            // primary path (default `<NNN>.svg`), since the surah
            // variant is rare and costs no perceptible benefit offline.
            try {
              const writeDir = new Directory(Paths.document, 'mushaf', riwaya);
              if (!writeDir.exists) writeDir.create({ intermediates: true });
              const writeFile = new File(
                writeDir,
                fallbackPath /* always the default variant */,
              );
              if (!writeFile.info().exists) writeFile.create();
              writeFile.write(xml);
            } catch {
              // ignore — read path still works in memory
            }
          }
        }

        if (cancelled) return;
        setRawText(xml);
        setViewBox(extractViewBox(xml));
      } catch (err) {
        if (!cancelled) {
          if (err instanceof SvgTextError) {
            setError(err.message);
            setErrorKind(err.kind);
          } else {
            setError(err instanceof Error ? err.message : String(err));
            setErrorKind('unknown');
          }
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

  return { text, viewBox, isLoading, error, errorKind };
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

/** Discriminated failure modes for `useSvgText`. Consumers (notably
 *  `MushafPageSvg`) use `errorKind` to pick the right copy + CTA. */
export type SvgTextErrorKind =
  'out-of-range' | 'not-cached-offline' | 'fetch-failed' | 'unknown';

export class SvgTextError extends Error {
  readonly kind: SvgTextErrorKind;
  constructor(kind: SvgTextErrorKind, message: string) {
    super(message);
    this.kind = kind;
    this.name = 'SvgTextError';
  }
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
