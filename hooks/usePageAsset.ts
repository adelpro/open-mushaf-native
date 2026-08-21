import { useEffect, useState } from 'react';

import { Asset } from 'expo-asset';
import { useAtomValue } from 'jotai/react';

import { ERROR_MESSAGES } from '@/constants/errorMessages';
import { mushafRiwaya } from '@/jotai/atoms';
import { getImagesMap } from '@/utils/pageImages';

/**
 * Hook to download and expose the Mushaf page image asset for a single page.
 * Shared by the horizontal reader (`useImagesArray`) and the vertical
 * reader (each virtualized page item loads its own asset).
 *
 * @param page - The 1-based page number to load.
 * @returns The downloaded `asset`, an `isLoading` boolean, and an `error`
 * string (if any).
 */
export const usePageAsset = (page: number) => {
  const [error, setError] = useState<string | null>(null);
  const [asset, setAsset] = useState<Asset | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const mushafRiwayaValue = useAtomValue(mushafRiwaya);

  useEffect(() => {
    let isActive = true;

    setIsLoading(true);
    setError(null);
    setAsset(null);

    const loadAsset = async () => {
      try {
        const imagesMap = getImagesMap(mushafRiwayaValue);
        if (!imagesMap) {
          return;
        }

        const image = imagesMap[page];
        if (!image) throw new Error(ERROR_MESSAGES.IMAGE_NOT_FOUND);

        const assetToLoad = Asset.fromModule(image);
        if (!assetToLoad.downloaded) {
          await assetToLoad.downloadAsync();
        }
        if (isActive) {
          setAsset(assetToLoad);
        }
      } catch (err) {
        if (isActive) {
          setError(
            err instanceof Error ? err.message : ERROR_MESSAGES.IMAGE_NOT_FOUND,
          );
          setAsset(null);
        }
      } finally {
        if (isActive) setIsLoading(false);
      }
    };

    void loadAsset();

    return () => {
      isActive = false;
    };
  }, [mushafRiwayaValue, page]);

  return { asset, isLoading, error };
};
