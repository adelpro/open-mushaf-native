import { Aya } from '@/types';
import { getDimensionCoeff } from '@/utils';

import { useImageCoordinateScaling } from './useImageCoordinateScaling';
import useQuranMetadata from './useQuranMetadata';

const usePageOverlay = ({
  index,
  dimensions,
}: {
  index: number;
  dimensions: { customPageWidth: number; customPageHeight: number };
}) => {
  const { ayaData, specsData } = useQuranMetadata();
  const page: Aya[] = ayaData[index];
  const { customPageHeight, customPageWidth } = dimensions;
  const {
    defaultPageHeight,
    defaultPageWidth,
    defaultMarginX,
    defaultMarginY,
    defaultLineHeight,
    defaultFirstPagesMarginX,
    defaultFirstPagesWidth,
    defaultFirstPagesMarginY,
  } = specsData;

  const { imageWidth, imageHeight, offsetX, offsetY, scaleX, scaleY } =
    useImageCoordinateScaling({
      containerWidth: customPageWidth,
      containerHeight: customPageHeight,
    });

  const heightCoeff = scaleY;
  const widthCoeff = scaleX;

  const calculateDimensions = () => {
    const lineHeight = defaultLineHeight * heightCoeff;

    const pageWidth =
      index <= 2
        ? defaultFirstPagesWidth * widthCoeff
        : defaultPageWidth * widthCoeff;

    const marginY =
      index <= 2
        ? defaultFirstPagesMarginY * widthCoeff
        : defaultMarginY * widthCoeff;
    return { lineHeight, marginY, pageWidth };
  };

  const { lineHeight, pageWidth, marginY } = calculateDimensions();

  let prevX = 0;

  const generateOverlay = () => {
    const overlayElements: {
      x: number;
      y: number;
      width: number;
      aya: number;
      surah: number;
    }[] = [];

    if (!page) {
      return overlayElements;
    }

    page.forEach((aya: Aya) => {
      const defaultX: number = aya[2];
      const defaultY: number = aya[3];

      // Calculate normalized coordinates (0-1) relative to original image dimensions
      const normalizedX =
        index <= 2
          ? (defaultX - defaultFirstPagesMarginX) /
            (defaultPageHeight - defaultFirstPagesMarginX)
          : (defaultX - defaultMarginX) / (defaultPageHeight - defaultMarginX);

      const normalizedY =
        index <= 2
          ? (defaultY - defaultFirstPagesMarginY) /
            (defaultFirstPagesWidth - defaultFirstPagesMarginY)
          : (defaultY - defaultMarginY) / (defaultPageWidth - defaultMarginY);

      // Convert to actual image pixel coordinates (strictly within image bounds)
      const X =
        Math.max(0, Math.min(normalizedX * imageHeight, imageHeight - 1)) +
        offsetY;
      const Y =
        Math.max(0, Math.min(normalizedY * imageWidth, imageWidth - 1)) +
        offsetX;

      // Define strict image boundaries
      const maxX = offsetY + imageHeight;
      const maxY = offsetX + imageWidth;
      const minX = offsetY;
      const minY = offsetX;

      // Only create overlays if coordinates are within image bounds
      if (X >= minX && X < maxX && Y >= minY && Y < maxY) {
        // Drawing overlay for aya line (first part before the aya marker)
        overlayElements.push({
          x: X,
          y: Y,
          width: maxY - Y,
          aya: aya[1],
          surah: aya[0],
        });
      }

      // Drawing overlay for aya line (last part after the aya marker in the same line)
      // 93 minimum aya end marker width scaled to image
      const scaledMinWidth = (93 / defaultPageWidth) * imageWidth;
      const adjustedMarginY = Math.max(minY, marginY + offsetX);

      if (
        Y > minY + scaledMinWidth &&
        adjustedMarginY < maxY &&
        Y > adjustedMarginY
      ) {
        overlayElements.push({
          x: X,
          y: adjustedMarginY,
          width: Math.min(Y - adjustedMarginY, maxY - adjustedMarginY),
          aya: aya[1] + 1,
          surah: aya[0],
        });
      }

      // Drawing overlay for multiple-line aya (only if valid line height and within bounds)
      if (lineHeight > 0 && X > prevX) {
        const numberOfLines: number = Math.ceil(
          (X - prevX - lineHeight) / lineHeight,
        );

        if (numberOfLines > 1) {
          let x = X;
          for (let i = 0; i < numberOfLines - 1; i++) {
            x -= lineHeight;
            // Ensure x coordinate stays within image bounds
            const clampedX = Math.max(minX, Math.min(x, maxX - 1));
            if (clampedX >= minX && clampedX < maxX && adjustedMarginY < maxY) {
              overlayElements.push({
                x: clampedX,
                y: adjustedMarginY,
                width: maxY - adjustedMarginY,
                aya: aya[1],
                surah: aya[0],
              });
            }
          }
        }
      }

      prevX = X;
    });

    return overlayElements;
  };

  return { overlay: generateOverlay(), lineHeight };
};

export default usePageOverlay;
