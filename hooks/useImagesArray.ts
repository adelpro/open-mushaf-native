import { useEffect, useState } from 'react';

import { Asset } from 'expo-asset';

import imagesMap from '@/constants/imagesMap';

import useCurrentPage from './useCurrentPage';

export default function useImagesArray() {
  const { currentPage } = useCurrentPage();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const requiredAssets = imagesMap[currentPage ?? 1];

  useEffect(() => {
    const loadAssets = async () => {
      setIsLoading(true);
      try {
        setError(null);
        if (requiredAssets) {
          // Ensure requiredAssets is an array
          const assetArray = Array.isArray(requiredAssets)
            ? requiredAssets
            : [requiredAssets];

          // Load all assets asynchronously
          const loadedAssets = await Promise.all(
            assetArray.map((asset) => Asset.loadAsync(asset)),
          );

          return loadedAssets.flat();
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAssets()
      .then((result) => {
        if (result) {
          setAssets(result);
          setError(null);
        } else {
          setError('No assets found');
        }
      })
      .catch((error) => setError(error?.message));
  }, [currentPage, requiredAssets]);

  return { isLoading, assets, error };
}
