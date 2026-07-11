import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';

import { Directory, File, Paths } from 'expo-file-system';
import { useAtomValue } from 'jotai/react';

import { quranSvgPageUrl, RIWAYA_PAGE_COUNTS } from '@/constants';
import { mushafRiwaya } from '@/jotai/atoms';
import { Riwaya } from '@/types';

/**
 * Prefetch a 4-page window of mushaf SVGs around `currentPage` so
 * page-to-page navigation feels instant. The web SW's `mushaf-svgs`
 * route handles browser caching; on native, pages are also persisted
 * to `Paths.document/mushaf/<riwaya>/<NNN>.svg` so the second read
 * is offline.
 *
 * @param currentPage - The page number currently being viewed.
 * @returns null - This hook is only utilized for its side-effects.
 */
export function useImagePreloader(currentPage: number) {
  const mushafRiwayaValue = useAtomValue(mushafRiwaya);
  // Keyed by `<riwaya>:<page>` because `mushafRiwaya` covers all 6
  // riwayat; switching riwaya re-runs the effect and we want each
  // riwaya's preloads tracked independently.
  const preloadedPagesRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    // Skip if riwaya is not defined (initial atom hydration).
    if (!mushafRiwayaValue) return;

    const riwaya: Riwaya = mushafRiwayaValue;
    const maxPage = RIWAYA_PAGE_COUNTS[riwaya];

    // Window: current, prev, next, next+1 — clamped to 1..maxPage.
    const pagesToPreload = [
      currentPage,
      Math.max(currentPage - 1, 1),
      Math.min(currentPage + 1, maxPage),
      Math.min(currentPage + 2, maxPage),
    ];

    const newPagesToPreload = pagesToPreload.filter(
      (page) => !preloadedPagesRef.current.has(`${riwaya}:${page}`),
    );
    if (newPagesToPreload.length === 0) return;

    const prefetch = async () => {
      try {
        await Promise.all(
          newPagesToPreload.map((page) => prefetchSvgPage(riwaya, page)),
        );

        // Mark these pages as preloaded.
        newPagesToPreload.forEach((page) => {
          preloadedPagesRef.current.add(`${riwaya}:${page}`);
        });

        // Limit the cache size by keeping only the current window.
        const pagesToKeep = new Set<string>(
          pagesToPreload.map((page) => `${riwaya}:${page}`),
        );
        preloadedPagesRef.current = new Set(
          [...preloadedPagesRef.current].filter((key) => pagesToKeep.has(key)),
        );
      } catch (error) {
        console.error('Error preloading pages:', error);
      }
    };

    prefetch();
  }, [currentPage, mushafRiwayaValue]);

  return null;
}

/**
 * Prefetch a single mushaf page from the SVG CDN.
 *
 * Web: `fetch()` only — the SW `mushaf-svgs` route caches the response.
 * Native: prefer the local FS cache; on miss, fetch from the CDN and
 * best-effort persist to disk so the next read is offline. Disk-write
 * failures are swallowed so online reading never regresses.
 */
async function prefetchSvgPage(riwaya: Riwaya, page: number): Promise<void> {
  const url = quranSvgPageUrl(riwaya, page);
  const padded = String(page).padStart(3, '0');

  if (Platform.OS === 'web') {
    const res = await fetch(url);
    // Drain the body so the connection is released; the SW keeps the
    // cached copy regardless of our local consumption.
    await res.text();
    return;
  }

  const dir = new Directory(Paths.document, 'mushaf', riwaya);

  // Disk hit: nothing to do — the cache layer that the renderer reads
  // (see useSvgText) will pick this up on next mount.
  try {
    await new File(dir, `${padded}.svg`).text();
    return;
  } catch {
    // Disk miss — fall through to network.
  }

  const res = await fetch(url);
  if (!res.ok) return;
  const xml = await res.text();

  // Best-effort persist. Mirrors the write path in hooks/useSvgText.ts.
  try {
    if (!dir.exists) dir.create({ intermediates: true });
    const file = new File(dir, `${padded}.svg`);
    if (!file.info().exists) file.create();
    file.write(xml);
  } catch {
    // ignore — the in-memory fetch still warmed the network layer
  }
}
