import { useEffect, useRef, useState } from 'react';

import { Asset } from 'expo-asset';
import { useAtomValue } from 'jotai/react';

import { imagesMapHafs, imagesMapWarsh } from '@/constants';
import { ERROR_MESSAGES } from '@/constants/errorMessages';
import { mushafRiwaya } from '@/jotai/atoms';

import { useCurrentPage } from './useCurrentPage';

/**
 * Hook to load the image asset for the current page based on the selected Riwaya.
 * Returns the downloaded asset along with loading and error states.
 *
 * @returns An object containing the downloaded `asset`, an `isLoading` boolean, and an `error` string (if any).
 */
export function useImagesArray() {
  const [error, setError] = useState<string | null>(null);
  const [asset, setAsset] = useState<Asset | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const mushafRiwayaValue = useAtomValue(mushafRiwaya);
  const { currentPage: page } = useCurrentPage();
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    setIsLoading(true);

    const loadAsset = async () => {
      try {
        if (mushafRiwayaValue === undefined) {
          return;
        }

        let imagesMap;
        switch (mushafRiwayaValue) {
          case 'hafs':
            imagesMap = imagesMapHafs;
            break;
          case 'warsh':
            imagesMap = imagesMapWarsh;
            break;
          default:
            imagesMap = undefined;
        }
        if (!imagesMap) {
          return;
        }

        const image = imagesMap[page];
        if (!image) throw new Error(ERROR_MESSAGES.IMAGE_NOT_FOUND);

        const assetToLoad = Asset.fromModule(image);
        if (!assetToLoad.downloaded) {
          await assetToLoad.downloadAsync();
        }
        // Only set asset if mounted
        if (isMounted.current) {
          setAsset(assetToLoad);
        }
      } catch (error) {
        if (isMounted.current) {
          setError(
            error instanceof Error
              ? error.message
              : ERROR_MESSAGES.IMAGE_NOT_FOUND,
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
  }, [mushafRiwayaValue, page]);

  return { asset, isLoading, error };
}
