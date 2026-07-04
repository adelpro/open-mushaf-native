import { useEffect, useState } from 'react';
import { Platform } from 'react-native';

import { Directory, File, Paths } from 'expo-file-system';

import { type Qiraa, quranSvgPageUrl } from '@/constants/svgCdn';

import { useQuranMetadata } from './useQuranMetadata';

/**
 * Reads the raw SVG XML text for a single mushaf page from the local
 * FS cache. The cache is populated by `useMushafDownload` —
 * Hafs and Warsh are auto-downloaded on first launch; the other four
 * qiraat are downloaded on demand.
 *
 * Cache layout (relative to `Paths.document`):
 *   mushaf/<qiraa>/<page>.svg
 *   mushaf/<qiraa>/<page>.json
 *
 * Returns `{ text, viewBox, isLoading, error }`.
 *
 * For multi-surah pages (e.g. Hafs page 106 hosts both surah 4 and
 * surah 5), pass `activeSurah` so we pick the variant
 * (`106-surah4.svg` vs `106-surah5.svg`). Falls back to the default
 * page SVG if the variant isn't found in the cache.
 */
export function useSvgText(args: {
  qiraa: Qiraa;
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
  const { qiraa, page, activeSurah } = args;
  const [text, setText] = useState<string | null>(null);
  const [viewBox, setViewBox] = useState<{
    minX: number;
    minY: number;
    width: number;
    height: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { specsData } = useQuranMetadata();
  const { defaultNumberOfPages = 604 } = specsData ?? {};

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);
    setText(null);
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
          const defaultUrl = quranSvgPageUrl(qiraa, page);
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
          const dir = new Directory(Paths.document, 'mushaf', qiraa);
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
        setText(xml);
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
  }, [qiraa, page, activeSurah, defaultNumberOfPages]);

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
