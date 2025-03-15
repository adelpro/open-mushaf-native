import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { Asset } from 'expo-asset';
import { useAtomValue } from 'jotai';

import { imagesMapHafs, imagesMapWarsh } from '@/constants';
import useCurrentPage from '@/hooks/useCurrentPage';
import { MushafRiwaya } from '@/jotai/atoms';

// Cache to store preloaded assets
const assetCache = new Map<string, Asset>();

export default function useImagesArray() {
  const [error, setError] = useState<string | null>(null);
  const [asset, setAsset] = useState<Asset | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const MushafRiwayaValue = useAtomValue(MushafRiwaya);
  const { currentPage: page } = useCurrentPage();
  const isMounted = useRef(true);

  const imagesMap = useMemo(() => {
    switch (MushafRiwayaValue) {
      case 0:
        return imagesMapWarsh;
      case 1:
        return imagesMapHafs;
      default:
        return undefined;
    }
  }, [MushafRiwayaValue]);

  // Helper function to load and cache an asset
  const loadAndCacheAsset = useCallback(
    async (pageNum: number): Promise<Asset | undefined> => {
      if (!imagesMap?.[pageNum]) return undefined;

      if (assetCache.size > 50) {
        // Clear oldest 10 entries
        const keys = Array.from(assetCache.keys()).slice(0, 10);
        keys.forEach((key) => assetCache.delete(key));
      }

      const cacheKey = `${MushafRiwayaValue}-${pageNum}`;
      if (assetCache.has(cacheKey)) {
        return assetCache.get(cacheKey) as Asset;
      }

      const image = imagesMap[pageNum];
      const assetToLoad = Asset.fromModule(image);

      if (!assetToLoad.downloaded) {
        await assetToLoad.downloadAsync();
      }

      assetCache.set(cacheKey, assetToLoad);
      return assetToLoad;
    },
    [imagesMap, MushafRiwayaValue],
  );

  // Prefetch adjacent pages
  const prefetchAdjacentPages = useCallback(async () => {
    if (!imagesMap) return;

    // Prefetch next and previous pages in parallel
    const pagesToPrefetch = [page + 1, page + 2, page - 1, page - 2].filter(
      (p) => p > 0 && p <= Object.keys(imagesMap).length,
    );

    Promise.all(pagesToPrefetch.map((p) => loadAndCacheAsset(p))).catch(
      (err) => {
        setError('خطأ في تحميل الصفحات');
      },
    );
  }, [page, imagesMap, loadAndCacheAsset]);

  useEffect(() => {
    isMounted.current = true;

    const loadAsset = async () => {
      try {
        if (!imagesMap?.[page]) {
          setIsLoading(false);
          return;
        }

        setIsLoading(true);

        // Try to get from cache first
        const cacheKey = `${MushafRiwayaValue}-${page}`;
        let assetToLoad = assetCache.get(cacheKey);

        if (!assetToLoad) {
          assetToLoad = await loadAndCacheAsset(page);
        }

        if (isMounted.current && assetToLoad) {
          setAsset(assetToLoad);
          setError(null);

          // Start prefetching adjacent pages after current page is loaded
          prefetchAdjacentPages();
        }
      } catch (error) {
        if (isMounted.current) {
          setError(
            error instanceof Error
              ? error.message
              : `الصفحة ${page} غير موجودة`,
          );
          setAsset(null);
        }
      } finally {
        if (isMounted.current) setIsLoading(false);
      }
    };

    loadAsset();

    return () => {
      isMounted.current = false;
    };
  }, [
    imagesMap,
    page,
    MushafRiwayaValue,
    loadAndCacheAsset,
    prefetchAdjacentPages,
  ]);

  return { asset, isLoading, error };
}
