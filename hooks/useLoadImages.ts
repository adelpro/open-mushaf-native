import { useEffect, useState } from 'react';

import { Asset } from 'expo-asset';

export default function useLoadImages(page: number) {
  const [imageUri, setImageUri] = useState<string | null>(null);

  useEffect(() => {
    const loadImage = async () => {
      try {
        const imageAsset = Asset.fromModule(
          // Preload static assets and then load dynamically
          require(
            `../assets/mushaf-data/mushaf-elmadina-warsh-azrak/${page}.png`,
          ),
        );
        await imageAsset.downloadAsync();
        setImageUri(imageAsset.localUri || null);
      } catch (error) {
        console.error('Error loading image: ', error);
      }
    };

    loadImage();
  }, [page]);

  return imageUri;
}
