import { useEffect, useRef, useState } from 'react';

import { Asset } from 'expo-asset';
import { useAtomValue } from 'jotai';

import { imagesMapHafs, imagesMapWarsh } from '@/constants';
import useCurrentPage from '@/hooks/useCurrentPage';
import { MushafRiwaya } from '@/jotai/atoms';

export default function useImagesArray() {
  const [error, setError] = useState<string | null>(null);
  const [asset, setAsset] = useState<Asset | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const MushafRiwayaValue = useAtomValue(MushafRiwaya);
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
        console.log('warsh selected');
        break;
      case 1:
        setImageMap(imagesMapHafs);
        console.log('hafs selected');
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
          setAsset(assetToLoad); // Only set asset if mounted
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
