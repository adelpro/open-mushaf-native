import { useEffect, useRef } from 'react';

import { Asset } from 'expo-asset';
import { useAtomValue } from 'jotai/react';

import { imagesMapHafs, imagesMapWarsh } from '@/constants';
import { mushafRiwaya } from '@/jotai/atoms';

import useQuranMetadata from './useQuranMetadata';

/**
 * Hook to preload images for smoother page navigation
 * Preloads the current page, next two pages, and previous page
 */
export default function useImagePreloader(currentPage: number) {
  const mushafRiwayaValue = useAtomValue(mushafRiwaya);
  const preloadedPagesRef = useRef<Set<number>>(new Set());
  const { specsData } = useQuranMetadata();
  const { defaultNumberOfPages } = specsData;

  useEffect(() => {
    // Skip if riwaya is not defined
    if (mushafRiwayaValue === undefined) return;

    const imagesMap =
      mushafRiwayaValue === 'hafs' ? imagesMapHafs : imagesMapWarsh;
    if (!imagesMap) return;

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

    // Preload new pages
    const preloadImages = async () => {
      try {
        const assetsToLoad = newPagesToPreload
          .map((page) => imagesMap[page])
          .filter(Boolean)
          .map((image) => Asset.fromModule(image));

        // Start downloading all assets in parallel
        await Promise.all(
          assetsToLoad.map(async (asset) => {
            if (!asset.downloaded) {
              await asset.downloadAsync();
            }
          }),
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

  return null; // This hook doesn't return anything
}
