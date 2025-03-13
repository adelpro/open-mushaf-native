import { useEffect, useRef, useState } from 'react';

import { Asset } from 'expo-asset';
import { useRecoilValue } from 'recoil';

import { imagesMapHafs, imagesMapWarsh } from '@/constants';
import useCurrentPage from '@/hooks/useCurrentPage';
import { MushafRiwaya } from '@/recoil/atom';

export default function useImagesArray() {
  const [error, setError] = useState<string | null>(null);
  const [asset, setAsset] = useState<Asset | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const MushafRiwayaValue = useRecoilValue(MushafRiwaya);
  const { currentPage: page } = useCurrentPage();
  const [imagesMap, setImageMap] = useState<
    Record<number, number> | undefined
  >();
  const isMounted = useRef(true);

  useEffect(() => {
    switch (MushafRiwayaValue) {
      case undefined:
        break;
      case 0:
        setImageMap(imagesMapWarsh);
        break;
      case 1:
        setImageMap(imagesMapHafs);
        break;
    }
  }, [MushafRiwayaValue]);
  useEffect(() => {
    isMounted.current = true;
    setIsLoading(true);
    if (imagesMap === undefined) {
      return;
    }
    const loadAsset = async () => {
      try {
        const image = imagesMap[page];
        if (!image) throw new Error(`الصفحة ${page} غير موجودة`);

        const assetToLoad = Asset.fromModule(image);
        if (!assetToLoad.downloaded) {
          await assetToLoad.downloadAsync();
        }
        if (isMounted.current) {
          // Only set asset if mounted
          setAsset(assetToLoad);
        }

        // Prefetch next and previous pages
        const nextPage = page + 1;
        if (imagesMap[nextPage]) {
          const nextAsset = Asset.fromModule(imagesMap[nextPage]);
          if (!nextAsset.downloaded) {
            await nextAsset.downloadAsync(); // Prefetch next
          }
        }
        const prevPage = page - 1;
        if (imagesMap[prevPage]) {
          const prevAsset = Asset.fromModule(imagesMap[prevPage]);
          if (!prevAsset.downloaded) {
            await prevAsset.downloadAsync(); // Prefetch previous
          }
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
  }, [imagesMap, page]);

  return { asset, isLoading, error };
}
