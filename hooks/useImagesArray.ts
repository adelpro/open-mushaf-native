import { useEffect, useRef, useState } from 'react';

import { Asset } from 'expo-asset';

import { imagesMapWarsh } from '@/constants';
import useCurrentPage from '@/hooks/useCurrentPage';

export default function useImagesArray() {
  const [error, setError] = useState<string | null>(null);
  const [asset, setAsset] = useState<Asset | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  //const { currentPage: page } = useCurrentPage();
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    setIsLoading(true);

    const loadAsset = async () => {
      try {
        const image = imagesMapWarsh[20];
        if (!image) throw new Error(`الصفحة ${20} غير موجودة`);

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
            error instanceof Error ? error.message : `الصفحة ${20} غير موجودة`,
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
  }, []);

  return { asset, isLoading, error };
}
