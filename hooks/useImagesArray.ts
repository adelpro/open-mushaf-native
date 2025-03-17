import { useEffect, useRef, useState } from 'react';

import { Asset } from 'expo-asset';
import { useRecoilValue } from 'recoil';

import { imagesMapHafs, imagesMapWarsh } from '@/constants';
import useCurrentPage from '@/hooks/useCurrentPage';
import { mushafRiwaya } from '@/recoil/atoms';

export default function useImagesArray() {
  const [error, setError] = useState<string | null>(null);
  const [asset, setAsset] = useState<Asset | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const MushafRiwayaValue = useRecoilValue(mushafRiwaya);
  const { currentPage: page } = useCurrentPage();
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    setIsLoading(true);

    const loadAsset = async () => {
      try {
        if (MushafRiwayaValue === undefined) {
          return;
        }
        console.log('MushafRiwayaValue2:', MushafRiwayaValue);
        const imagesMap =
          MushafRiwayaValue === 'hafs' ? imagesMapHafs : imagesMapWarsh;
        if (!imagesMap) throw new Error('imagesMap is undefined');

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
  }, [MushafRiwayaValue, page]);

  return { asset, isLoading, error };
}
