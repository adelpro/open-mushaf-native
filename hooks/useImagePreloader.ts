import { useEffect, useRef } from 'react';

import { Image } from 'expo-image';
import { useAtomValue } from 'jotai/react';

import { quranPngPageUrl } from '@/constants';
import { mushafRiwaya } from '@/jotai/atoms';
import { isMushafPageCached } from '@/utils/downloads';

import { useQuranMetadata } from './useQuranMetadata';

/**
 * Preload nearby remote PNG pages for smoother navigation.
 *
 * @param currentPage - The page number currently being viewed.
 * @returns null - This hook is only utilized for its side-effects.
 */
export function useImagePreloader(currentPage: number) {
  const mushafRiwayaValue = useAtomValue(mushafRiwaya);
  const preloadedPagesRef = useRef<Set<string>>(new Set());
  const { specsData } = useQuranMetadata();
  const { defaultNumberOfPages } = specsData;

  useEffect(() => {
    let active = true;
    const riwaya = mushafRiwayaValue;
    // Calculate pages to preload (current, previous one, next two)
    const pagesToPreload = [
      currentPage,
      Math.max(currentPage - 1, 1),
      Math.min(currentPage + 1, defaultNumberOfPages),
      Math.min(currentPage + 2, defaultNumberOfPages),
    ];

    // Filter out already preloaded pages
    const newPagesToPreload = pagesToPreload.filter(
      (page) => !preloadedPagesRef.current.has(`${riwaya}:${page}`),
    );

    if (newPagesToPreload.length === 0) return;

    const preloadImages = async () => {
      try {
        await Promise.all(
          newPagesToPreload.map(async (page) => {
            let cached = false;
            try {
              cached = await isMushafPageCached(riwaya, page);
            } catch {
              /* Storage is optional for online reading. */
            }
            if (active && !cached)
              await Image.prefetch(quranPngPageUrl(riwaya, page));
          }),
        );

        if (!active) return;
        // Mark these pages as preloaded
        newPagesToPreload.forEach((page) => {
          preloadedPagesRef.current.add(`${riwaya}:${page}`);
        });

        // Limit the cache size by removing pages that are far from current view
        // Keep only the current page, previous 1 page, and next 2 pages
        const pagesToKeep = new Set<string>(
          [
            currentPage,
            Math.max(currentPage - 1, 1),
            Math.min(currentPage + 1, defaultNumberOfPages),
            Math.min(currentPage + 2, defaultNumberOfPages),
          ].map((page) => `${riwaya}:${page}`),
        );

        preloadedPagesRef.current = new Set(
          [...preloadedPagesRef.current].filter((page) =>
            pagesToKeep.has(page),
          ),
        );
      } catch (error) {
        console.error('Error preloading images:', error);
      }
    };

    void preloadImages();
    return () => {
      active = false;
    };
  }, [currentPage, defaultNumberOfPages, mushafRiwayaValue]);

  return null;
}
