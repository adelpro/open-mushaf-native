import { useEffect, useState } from 'react';

import { Asset } from 'expo-asset';

import { imagesMap } from '@/constants';
import useCurrentPage from '@/hooks/useCurrentPage';

export default function useImagesArray() {
  const [error, setError] = useState<string | null>(null);
  const [asset, setAsset] = useState<Asset | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { currentPage: page } = useCurrentPage();

  useEffect(() => {
    const loadAsset = async () => {
      setIsLoading(true);
      try {
        const image = imagesMap[page];
        if (!image) throw new Error(`الصفحة ${page} غير موجودة`);

        const assetToLoad = Asset.fromModule(image);
        if (!assetToLoad.downloaded) {
          await assetToLoad.downloadAsync();
        }

        setAsset(assetToLoad);
      } catch (error) {
        setError(
          error instanceof Error ? error.message : `الصفحة ${page} غير موجودة`,
        );
        setAsset(null);
      } finally {
        setIsLoading(false);
      }
    };

    const timeout = setTimeout(() => loadAsset(), 300);
    return () => clearTimeout(timeout);
  }, [page]);

  return { asset, isLoading, error };
}
