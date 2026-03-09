import { Aya } from '@/types';
import { getDimensionCoeff } from '@/utils';

import { useQuranMetadata } from './useQuranMetadata';

/**
 * Hook to generate coordinate dimensions for drawing an interactive overlay
 * over Ayas on a specific Quran page image.
 *
 * @param args - Configuration object for calculating the overlay.
 * @param args.index - The 1-based page index to retrieve Aya coordinate data for.
 * @param args.dimensions - Custom defined width and height of the rendered page container.
 *
 * @returns An object containing the generated `overlay` coordinate array and the calculated `lineHeight`.
 */
export function usePageOverlay({
  index,
  dimensions,
}: {
  index: number;
  dimensions: { customPageWidth: number; customPageHeight: number };
}) {
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

  const heightCoeff = getDimensionCoeff({
    defaultDimension: defaultPageHeight,
    customDimension: customPageHeight,
  });
  const widthCoeff = getDimensionCoeff({
    defaultDimension: defaultPageWidth,
    customDimension: customPageWidth,
  });

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

      const X =
        index <= 2
          ? (defaultX - defaultFirstPagesMarginX) * heightCoeff
          : (defaultX - defaultMarginX) * heightCoeff;

      const Y =
        index <= 2
          ? (defaultY - defaultFirstPagesMarginX) * widthCoeff
          : (defaultY - defaultMarginY) * widthCoeff;

      // Drawing overlay for aya line (first part before the aya marker)
      overlayElements.push({
        x: X,
        y: Y,
        width: pageWidth - Y,
        aya: aya[1],
        surah: aya[0],
      });

      // Drawing overlay for aya line (last part after the aya marker in the same line)
      // 93 minimum aya end marker width
      if (Y > 93) {
        overlayElements.push({
          x: X,
          y: marginY,
          width: Y - marginY,
          aya: aya[1] + 1,
          surah: aya[0],
        });
      }

      // Drawing overlay for multiple-line aya

      const numberOfLines: number = Math.ceil(
        (X - prevX - lineHeight) / lineHeight,
      );

      if (numberOfLines > 1) {
        let x = X;
        for (let i = 0; i < numberOfLines - 1; i++) {
          x -= lineHeight;
          if (x >= lineHeight) {
            overlayElements.push({
              x: x,
              y: marginY,
              width: pageWidth - marginY,
              aya: aya[1],
              surah: aya[0],
            });
          }
        }
      }

      prevX = X;
    });

    return overlayElements;
  };

  return { overlay: generateOverlay(), lineHeight };
}
