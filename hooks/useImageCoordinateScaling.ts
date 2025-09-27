import { useMemo } from 'react';

import useQuranMetadata from './useQuranMetadata';

type ImageDimensions = {
  containerWidth: number;
  containerHeight: number;
};

export const useImageCoordinateScaling = ({
  containerWidth,
  containerHeight,
}: ImageDimensions) => {
  const { specsData } = useQuranMetadata();
  const { defaultPageWidth, defaultPageHeight } = specsData;

  const actualImageDimensions = useMemo(() => {
    if (
      !containerWidth ||
      !containerHeight ||
      !defaultPageWidth ||
      !defaultPageHeight
    ) {
      return {
        imageWidth: containerWidth,
        imageHeight: containerHeight,
        offsetX: 0,
        offsetY: 0,
        scaleX: 1,
        scaleY: 1,
      };
    }

    const containerAspectRatio = containerWidth / containerHeight;
    const imageAspectRatio = defaultPageWidth / defaultPageHeight;

    let imageWidth: number;
    let imageHeight: number;
    let offsetX: number;
    let offsetY: number;

    if (containerAspectRatio > imageAspectRatio) {
      // Container is wider than image - image height fills container, width is scaled
      imageHeight = containerHeight;
      imageWidth = containerHeight * imageAspectRatio;
      offsetX = (containerWidth - imageWidth) / 2;
      offsetY = 0;
    } else {
      // Container is taller than image - image width fills container, height is scaled
      imageWidth = containerWidth;
      imageHeight = containerWidth / imageAspectRatio;
      offsetX = 0;
      offsetY = (containerHeight - imageHeight) / 2;
    }

    const scaleX = imageWidth / defaultPageWidth;
    const scaleY = imageHeight / defaultPageHeight;

    return {
      imageWidth,
      imageHeight,
      offsetX,
      offsetY,
      scaleX,
      scaleY,
    };
  }, [containerWidth, containerHeight, defaultPageWidth, defaultPageHeight]);

  return actualImageDimensions;
};
