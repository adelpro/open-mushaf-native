import { useEffect, useRef, useState } from 'react';

import { Asset } from 'expo-asset';
import { useAtomValue } from 'jotai/react';

import { imagesMapHafs, imagesMapWarsh } from '@/constants';
import { ERROR_PAGE_NOT_FOUND } from '@/constants/errorMessages';
import { mushafRiwaya } from '@/jotai/atoms';

import { useCurrentPage } from './useCurrentPage';

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
        if (!image) throw new Error(ERROR_PAGE_NOT_FOUND(page));

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
          // eslint-disable-next-line no-console
          console.error('[useImagesArray] Failed to load page asset:', error);
          setError(ERROR_PAGE_NOT_FOUND(page));
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
