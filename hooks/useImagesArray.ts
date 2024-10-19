import { useEffect, useState } from 'react';

import { useAssets } from 'expo-asset';
import { useRecoilValue } from 'recoil';

import imagesMap from '@/constants/imagesMap';
import { currentSavedPage } from '@/recoil/atoms';

export default function useImagesArray() {
  const currentSavedPageValue = useRecoilValue(currentSavedPage);
  const [requiredPage, setRequiredPage] = useState(
    imagesMap[currentSavedPageValue],
  );

  const [assets, error] = useAssets([requiredPage]);

  useEffect(() => {
    console.log('currentSavedPageValue changed to: ', currentSavedPageValue);
    if (!currentSavedPageValue) {
      return;
    }

    setRequiredPage(imagesMap[currentSavedPageValue]);
  }, [currentSavedPageValue]);

  return { assets, error };
}
