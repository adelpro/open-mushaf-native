import React, { useState } from 'react';
import { TouchableOpacity, View } from 'react-native';

import { Aya } from '@/types';
import { getDimensionCoeff } from '@/utils';

import { useCoordinates } from './useCoordinates';
import { useSpecs } from './useSpecs';

type SelectedAya = {
  aya: number;
  sura: number;
};

type Props = {
  index: number;
  dimensions: { customPageWidth: number; customPageHeight: number };
};

const usePageOverlay = ({ index, dimensions }: Props) => {
  const { page } = useCoordinates(index);

  const [selectedAya, setSelectedAya] = useState<SelectedAya>({
    aya: 0,
    sura: 0,
  });
  const [show, setShow] = useState<boolean>(false);
  const { customPageHeight, customPageWidth } = dimensions;
  const {
    specs: {
      defaultPageHeight,
      defaultPageWidth,
      defaultMarginX,
      defaultMarginY,
      defaultLineHeight,
      defaultFirstPAgesMarginX,
      defaultFirstPagesWidth,
      defaultFirstPagesMarginY,
    },
  } = useSpecs();

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

  const handleAyaClick = ({ aya, sura }: { aya: number; sura: number }) => {
    setSelectedAya({ aya, sura });
    setShow(true);
  };

  const renderOverlayElement = (
    top: number,
    left: number,
    width: number,
    aya: number,
    sura: number,
    backgroundColor: string,
  ) => {
    return (
      <TouchableOpacity
        key={`${sura}-${aya}-${top}-${left}`}
        accessible={true}
        accessibilityLabel={`aya - ${aya} sura - ${sura}`}
        accessibilityRole="button"
        style={{
          position: 'absolute',
          top,
          left,
          width,
          height: lineHeight,
          backgroundColor,
        }}
        onPress={() => handleAyaClick({ aya, sura })}
      >
        <View />
      </TouchableOpacity>
    );
  };

  const generateOverlay = () => {
    const overlayElements: React.ReactNode[] = [];

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
      overlayElements.push(
        renderOverlayElement(
          X,
          Y - marginY,
          pageWidth + marginY - Y,
          aya[1],
          aya[0],
          show && selectedAya.aya === aya[1] && selectedAya.sura === aya[0]
            ? 'rgba(128, 128, 128, 0.5)'
            : 'transparent',
        ),
      );

      // Drawing overlay for aya line (last part after the aya marker in the same line)
      if (Y > 93) {
        overlayElements.push(
          renderOverlayElement(
            X,
            marginY,
            Y - marginY * 2,
            aya[1] + 1,
            aya[0],
            show &&
              selectedAya.aya === aya[1] + 1 &&
              selectedAya.sura === aya[0]
              ? 'rgba(128, 128, 128, 0.5)'
              : 'transparent',
          ),
        );
      }

      // Drawing overlay for multiple-line aya
      const numberOfLines: number = Math.ceil((X - prevX) / lineHeight);

      if (numberOfLines > 1) {
        let x = X;
        for (let i = 0; i < numberOfLines - 1; i++) {
          x -= lineHeight;
          if (x >= 40 && selectedAya.aya !== 1) {
            overlayElements.push(
              renderOverlayElement(
                x,
                marginY,
                pageWidth - marginY,
                aya[1],
                aya[0],
                show &&
                  selectedAya.aya === aya[1] &&
                  selectedAya.sura === aya[0]
                  ? 'rgba(128, 128, 128, 0.5)'
                  : 'transparent',
              ),
            );
          }
        }
      }

      prevX = X;
    });

    return overlayElements;
  };

  return { overlay: generateOverlay(), show, setShow, selectedAya };
};

export default usePageOverlay;
