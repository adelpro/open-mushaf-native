import { useEffect, useState } from 'react';

import { Asset } from 'expo-asset';

import imagesMap from '@/constants/imagesMap';

import useCurrentPage from './useCurrentPage';

export default function useImagesArray() {
  const { currentPage } = useCurrentPage();
  const [assets, setAssets] = useState<Asset[]>([]); // State to hold loaded assets
  const [error, setError] = useState<string | null>(null); // State to hold any loading errors
  const requiredAssets = imagesMap[currentPage]; // Get the required assets for the current page

  useEffect(() => {
    const loadAssets = async () => {
      try {
        if (requiredAssets) {
          // Ensure requiredAssets is an array
          const assetArray = Array.isArray(requiredAssets)
            ? requiredAssets
            : [requiredAssets];

          // Load all assets asynchronously
          const loadedAssets = await Promise.all(
            assetArray.map((asset) => Asset.loadAsync(asset)),
          );

          setAssets(loadedAssets.flat());
        }
      } catch {
        setError('Error loading assets');
      }
    };

    loadAssets();
  }, [currentPage, requiredAssets]); // Dependency array includes currentPage and requiredAssets

  return { assets, error };
}
