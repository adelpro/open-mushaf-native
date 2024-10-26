import { useEffect, useState } from 'react';

import { Asset } from 'expo-asset';

import { imagesMap } from '@/constants';
import useCurrentPage from '@/hooks/useCurrentPage';

export default function useImagesArray() {
  const [error, setError] = useState<string | null>(null);
  const [asset, setAsset] = useState<Asset[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { currentPage } = useCurrentPage();

  useEffect(() => {
    const getAsset = async (page: number) => {
      setError(null);
      setIsLoading(true);
      try {
        const image = imagesMap[page];

        const loadedAsset = await Asset.loadAsync(image);
        if (!loadedAsset) {
          setError(`الصفحة ${page} غير موجودة`);
          return null;
        }
        console.log({ loadedAsset });
        return setAsset(loadedAsset);
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError(`الصفحة ${page} غير موجودة`);
        }
        return null;
      } finally {
        setIsLoading(false);
      }
    };
    getAsset(currentPage);
  }, [currentPage]);

  return { asset, isLoading, error };
}
