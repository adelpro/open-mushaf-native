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
    return MushafRiwayaValue === 0 ? imagesMapWarsh : imagesMapHafs;
  }, [MushafRiwayaValue]);

  const loadAndCacheAsset = useCallback(
    async (pageNum: number): Promise<Asset | undefined> => {
      const cacheKey = `${MushafRiwayaValue}-${pageNum}`;
      if (assetCache.has(cacheKey)) {
        return assetCache.get(cacheKey);
      }

      const image = imagesMap?.[pageNum];
      if (!image) return undefined;

      const assetToLoad = Asset.fromModule(image);
      if (!assetToLoad.downloaded) {
        await assetToLoad.downloadAsync();
      }

      assetCache.set(cacheKey, assetToLoad);

      // Maintain cache size limit
      if (assetCache.size > 50) {
        const keys = Array.from(assetCache.keys()).slice(0, 10);
        keys.forEach((key) => assetCache.delete(key));
      }

      return assetToLoad;
    },
    [imagesMap, MushafRiwayaValue],
  );

  const prefetchAdjacentPages = useCallback(async () => {
    if (!imagesMap) return;

    const totalPages = Object.keys(imagesMap).length;
    const pagesToPrefetch = [page + 1, page - 1].filter(
      (p) => p > 0 && p <= totalPages,
    );

    try {
      await Promise.all(pagesToPrefetch.map((p) => loadAndCacheAsset(p)));
    } catch {
      setError('خطأ في تحميل الصفحات');
    }
  }, [page, imagesMap, loadAndCacheAsset]);

  useEffect(() => {
    isMounted.current = true;

    const loadAsset = async () => {
      setIsLoading(true);

      try {
        const assetToLoad = await loadAndCacheAsset(page);
        if (isMounted.current) {
          setAsset(assetToLoad || null);
          setError(assetToLoad ? null : `الصفحة ${page} غير موجودة`);
          prefetchAdjacentPages();
        }
      } catch (err) {
        if (isMounted.current) {
          setError(
            err instanceof Error ? err.message : `الصفحة ${page} غير موجودة`,
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
  }, [page, loadAndCacheAsset, prefetchAdjacentPages]);

  return { asset, isLoading, error };
}
