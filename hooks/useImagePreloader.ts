import { useEffect, useRef } from 'react';

import { Image } from 'expo-image';
import { useAtomValue } from 'jotai/react';

import { quranPngPageUrl } from '@/constants';
import { mushafRiwaya } from '@/jotai/atoms';

import { useQuranMetadata } from './useQuranMetadata';

/**
 * Preload nearby remote PNG pages for smoother navigation.
 *
 * @param currentPage - The page number currently being viewed.
 * @returns null - This hook is only utilized for its side-effects.
 */
export function useImagePreloader(currentPage: number) {
  const mushafRiwayaValue = useAtomValue(mushafRiwaya);
  const preloadedPagesRef = useRef<Set<number>>(new Set());
  const { specsData } = useQuranMetadata();
  const { defaultNumberOfPages } = specsData;

  useEffect(() => {
    // Calculate pages to preload (current, previous one, next two)
    const pagesToPreload = [
      currentPage,
      Math.max(currentPage - 1, 1),
      Math.min(currentPage + 1, defaultNumberOfPages),
      Math.min(currentPage + 2, defaultNumberOfPages),
    ];

    // Filter out already preloaded pages
    const newPagesToPreload = pagesToPreload.filter(
      (page) => !preloadedPagesRef.current.has(page),
    );

    if (newPagesToPreload.length === 0) return;

    const preloadImages = async () => {
      try {
        await Promise.all(
          newPagesToPreload.map((page) =>
            Image.prefetch(quranPngPageUrl(mushafRiwayaValue, page)),
          ),
        );

        // Mark these pages as preloaded
        newPagesToPreload.forEach((page) => {
          preloadedPagesRef.current.add(page);
        });

        // Limit the cache size by removing pages that are far from current view
        // Keep only the current page, previous 1 page, and next 2 pages
        const pagesToKeep = new Set<number>([
          currentPage,
          Math.max(currentPage - 1, 1),
          Math.min(currentPage + 1, defaultNumberOfPages),
          Math.min(currentPage + 2, defaultNumberOfPages),
        ]);

        preloadedPagesRef.current = new Set(
          [...preloadedPagesRef.current].filter((page) =>
            pagesToKeep.has(page),
          ),
        );
      } catch (error) {
        console.error('Error preloading images:', error);
      }
    };

    preloadImages();
  }, [currentPage, defaultNumberOfPages, mushafRiwayaValue]);

  return null;
}
