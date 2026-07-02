import { useEffect, useState } from 'react';

import { Directory, File, Paths } from 'expo-file-system';

import { type Qiraa } from '@/constants/svgCdn';
import type { QuranSvgPageAyah } from '@/types/quran-svg';

import { useQuranMetadata } from './useQuranMetadata';

/**
 * Reads the per-page polygon JSON for a single mushaf page from the
 * local FS cache (populated by `useMushafDownload`).
 *
 * Each entry is a hit-region for one ayah:
 *   { ayahNumber, surahNumber, x, y, polygon }
 * where `polygon` is a space-separated string of "x,y" vertices in
 * the page's viewBox space.
 *
 * Returns `{ ayahs, isLoading, error }`.
 */
export function useSvgPolygons(args: { qiraa: Qiraa; page: number }): {
  ayahs: QuranSvgPageAyah[];
  isLoading: boolean;
  error: string | null;
} {
  const { qiraa, page } = args;
  const [ayahs, setAyahs] = useState<QuranSvgPageAyah[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { specsData } = useQuranMetadata();
  const { defaultNumberOfPages = 604 } = specsData ?? {};

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);
    setAyahs([]);

    const load = async () => {
      try {
        if (page < 1 || page > defaultNumberOfPages) {
          throw new Error(
            `Page ${page} out of range 1..${defaultNumberOfPages}`,
          );
        }
        const padded = String(page).padStart(3, '0');
        const dir = new Directory(Paths.document, 'mushaf', qiraa);
        const raw = await new File(dir, `${padded}.json`).text();
        const parsed = JSON.parse(raw) as unknown;
        if (!Array.isArray(parsed)) {
          throw new Error(
            `Polygon JSON for ${qiraa}/${padded} is not an array`,
          );
        }
        if (cancelled) return;
        setAyahs(parsed as QuranSvgPageAyah[]);
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
  }, [qiraa, page, defaultNumberOfPages]);

  return { ayahs, isLoading, error };
}
