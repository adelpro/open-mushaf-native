import { Aya, Page } from '@/types';
import { getDimensionCoeff } from '@/utils';

import ayas from '../assets/quran-metadata/mushaf-elmadina-warsh-azrak/aya.json';
import specs from '../assets/quran-metadata/mushaf-elmadina-warsh-azrak/specs.json';

const usePageOverlay = ({
  index,
  dimensions,
}: {
  index: number;
  dimensions: { customPageWidth: number; customPageHeight: number };
}) => {
  const coordinates = ayas.coordinates as Page[];
  const page = coordinates[index] as Aya[];
  const { customPageHeight, customPageWidth } = dimensions;
  const {
    defaultPageHeight,
    defaultPageWidth,
    defaultMarginX,
    defaultMarginY,
    defaultLineHeight,
    defaultFirstPAgesMarginX,
    defaultFirstPagesWidth,
    defaultFirstPagesMarginY,
  } = specs;

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
    let marginX = defaultMarginX * heightCoeff;
    if (index <= 2) marginX = defaultFirstPAgesMarginX * heightCoeff;

    const pageWidth =
      index <= 2
        ? defaultFirstPagesWidth * widthCoeff
        : defaultPageWidth * widthCoeff;
    const marginY =
      index <= 2
        ? defaultFirstPagesMarginY * widthCoeff
        : defaultMarginY * widthCoeff;

    return { lineHeight, marginX, marginY, pageWidth };
  };

  const { lineHeight, marginX, pageWidth, marginY } = calculateDimensions();

  let prevX = marginX;

  const generateOverlay = () => {
    const overlayElements: any[] = [];

    if (!page) {
      return overlayElements;
    }

    page.forEach((aya: Aya) => {
      const defaultX: number = aya[2];
      const defaultY: number = aya[3];

      // Dimensions correction
      let X = defaultX * heightCoeff;

      // Correction for 1/2 pages only
      if (index <= 2) {
        X = (defaultX - 100) * heightCoeff;
      }
      const Y = defaultY * widthCoeff;

      // Drawing overlay for aya line (first part before the aya marker)
      overlayElements.push({
        x: X,
        y: Y - marginY,
        width: pageWidth + marginY - Y,
        aya: aya[1],
        surah: aya[0],
      });

      // Drawing overlay for aya line (last part after the aya marker in the same line)
      if (Y > 93) {
        overlayElements.push({
          x: X,
          y: marginY,
          width: Y - marginY * 2,
          aya: aya[1] + 1,
          surah: aya[0],
        });
      }

      // Drawing overlay for multiple-line aya
      const numberOfLines: number = Math.ceil((X - prevX) / lineHeight);

      if (numberOfLines > 1) {
        let x = X;
        for (let i = 0; i < numberOfLines - 1; i++) {
          x -= lineHeight;
          if (x >= 40) {
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
  console.log('index', index, 'dimensions', dimensions);

  return { overlay: generateOverlay() };
};

export default usePageOverlay;
