import { useEffect, useState } from 'react';

import { Asset } from 'expo-asset';

import { imagesMapWarsh } from '@/constants';
import useCurrentPage from '@/hooks/useCurrentPage';

export default function useImagesArray() {
  const [error, setError] = useState<string | null>(null);
  const [asset, setAsset] = useState<Asset | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { currentPage: page } = useCurrentPage();

  useEffect(() => {
    setIsLoading(true);

    const loadAsset = async () => {
      try {
        const image = imagesMapWarsh[page];
        if (!image) throw new Error(`الصفحة ${page} غير موجودة`);

        const assetToLoad = Asset.fromModule(image);
        if (!assetToLoad.downloaded) {
          await assetToLoad.downloadAsync();
        }

        setAsset(assetToLoad); // Only set asset if mounted
      } catch (error) {
        setError(
          error instanceof Error ? error.message : `الصفحة ${page} غير موجودة`,
        );
        setAsset(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadAsset();
  }, [page]);

  return { asset, isLoading, error };
}
