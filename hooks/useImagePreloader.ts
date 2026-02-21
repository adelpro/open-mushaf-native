import { useEffect, useRef } from 'react';
import { Alert } from 'react-native';

import { useAtomValue } from 'jotai/react';

import { imagesMapHafs, imagesMapWarsh } from '@/constants';
import { mushafRiwaya } from '@/jotai/atoms';
import { cleanupAssetCache, getOrCreateAsset } from '@/utils/assetCache';

import useQuranMetadata from './useQuranMetadata';

/**
 * Hook to preload images for smoother page navigation
 * Preloads 5 pages before and 5 pages after the current page
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

    // Calculate pages to preload (current, 5 before, 5 after)
    const pagesToPreload: number[] = [];
    for (let i = -5; i <= 5; i++) {
      const page = currentPage + i;
      if (page >= 1 && page <= defaultNumberOfPages) {
        pagesToPreload.push(page);
      }
    }

    // Filter out already preloaded pages
    const newPagesToPreload = pagesToPreload.filter(
      (page) => !preloadedPagesRef.current.has(page),
    );

    if (newPagesToPreload.length === 0) return;

    // Preload new pages
    const preloadImages = async () => {
      try {
        /* console.log(
          `[Preloader] 🔄 Starting to load pages: ${newPagesToPreload.join(', ')} (Current: ${currentPage})`,
         ); */

        // Start downloading all assets in parallel
        await Promise.all(
          newPagesToPreload.map(async (page) => {
            const imageModule = imagesMap[page];
            if (!imageModule) {
              // console.log(`[Preloader] ⚠️ No image module for page ${page}`);
              return;
            }

            const asset = getOrCreateAsset(page, imageModule);

            if (!asset.downloaded) {
              // console.log(`[Preloader] ⬇️ Downloading page ${page}...`);
              await asset.downloadAsync();
              // console.log(`[Preloader] ✅ Downloaded page ${page}`);
            } else {
              // console.log(`[Preloader] ✓ Page ${page} already cached`);
            }
          }),
        );

        /* console.log(
          `[Preloader] 🎉 Successfully loaded ${newPagesToPreload.length} pages`,
        ); */

        // Mark these pages as preloaded
        newPagesToPreload.forEach((page) => {
          preloadedPagesRef.current.add(page);
        });

        // Limit the cache size by removing pages that are far from current view
        // Keep only pages within 5 pages range
        const pagesToKeep = new Set<number>();
        for (let i = -5; i <= 5; i++) {
          const page = currentPage + i;
          if (page >= 1 && page <= defaultNumberOfPages) {
            pagesToKeep.add(page);
          }
        }

        cleanupAssetCache(pagesToKeep);

        preloadedPagesRef.current = new Set(
          [...preloadedPagesRef.current].filter((page) =>
            pagesToKeep.has(page),
          ),
        );
      } catch (error: any) {
        Alert.alert(
          'Error preloading images: ',
          error.message || 'Unknown error',
        );
      }
    };

    preloadImages();
  }, [currentPage, defaultNumberOfPages, mushafRiwayaValue]);

  return null; // This hook doesn't return anything
}
