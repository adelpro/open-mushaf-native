import { useEffect, useState } from 'react';

import { useAtomValue } from 'jotai/react';

import { ERROR_MESSAGES } from '@/constants/errorMessages';
import { mushafRiwaya } from '@/jotai/atoms';
import { getMushafPageUri, releaseMushafPageUri } from '@/utils/downloads';
import { getPageSource } from '@/utils/pages';

export interface PageAsset {
  localUri: string;
}

/**
 * Resolve the active riwaya page from the downloaded PNG cache, falling back
 * to the remote PNG CDN when the page is not cached yet.
 */
export const usePageAsset = (page: number) => {
  const [error, setError] = useState<string | null>(null);
  const [asset, setAsset] = useState<PageAsset | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const mushafRiwayaValue = useAtomValue(mushafRiwaya);

  useEffect(() => {
    let isActive = true;

    setIsLoading(true);
    setError(null);
    setAsset(null);

    let cachedUri: string | undefined;

    const loadAsset = async () => {
      try {
        const pageSource = getPageSource(mushafRiwayaValue, page);
        if (!pageSource) {
          throw new Error(ERROR_MESSAGES.IMAGE_NOT_FOUND);
        }

        // Prefer an explicitly downloaded page. The CDN remains the normal
        // online fallback when this page has not been cached.
        cachedUri = await getMushafPageUri(mushafRiwayaValue, page);

        if (isActive) {
          setAsset({ localUri: cachedUri ?? pageSource.source });
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
      if (cachedUri) releaseMushafPageUri(cachedUri);
    };
  }, [mushafRiwayaValue, page]);

  return { asset, isLoading, error };
};
