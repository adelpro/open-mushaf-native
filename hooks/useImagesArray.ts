import { useEffect, useRef, useState } from 'react';

import { Asset } from 'expo-asset';
import { useAtomValue } from 'jotai/react';

import { imagesMapHafs, imagesMapWarsh } from '@/constants';
import useCurrentPage from '@/hooks/useCurrentPage';
import { mushafRiwaya } from '@/jotai/atoms';
import { getOrCreateAsset } from '@/utils/assetCache';

export default function useImagesArray() {
  const [error, setError] = useState<string | null>(null);
  const [asset, setAsset] = useState<Asset | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const mushafRiwayaValue = useAtomValue(mushafRiwaya);
  const { currentPage: page } = useCurrentPage();
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;

    const loadAsset = async () => {
      try {
        if (mushafRiwayaValue === undefined) {
          return;
        }

        let imagesMap;
        switch (mushafRiwayaValue) {
          case 'hafs':
            imagesMap = imagesMapHafs;
            break;
          case 'warsh':
            imagesMap = imagesMapWarsh;
            break;
          default:
            imagesMap = undefined;
        }
        if (!imagesMap) {
          return;
        }

        const image = imagesMap[page];
        if (!image) throw new Error(`الصفحة ${page} غير موجودة`);

        const assetToLoad = getOrCreateAsset(page, image);

        // Check if already downloaded (cached) - no loading indicator needed
        if (assetToLoad.downloaded) {
          // console.log(`[ImagesArray] Page ${page} loaded from cache ✓`);
          if (isMounted.current) {
            setAsset(assetToLoad);
          }
          return;
        }

        // console.log(`[ImagesArray] Page ${page} not cached, downloading...`);

        // Only show loading if not cached
        if (isMounted.current) setIsLoading(true);

        await assetToLoad.downloadAsync();

        // console.log(`[ImagesArray] Page ${page} download complete ✓`);

        // Only set asset if mounted
        if (isMounted.current) {
          setAsset(assetToLoad);
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
      isMounted.current = false; // Mark as unmounted
    };
  }, [mushafRiwayaValue, page]);

  return { asset, isLoading, error };
}
