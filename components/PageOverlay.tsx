import { useState } from 'react';
import { I18nManager, Pressable, StyleSheet } from 'react-native';

import { useSetAtom } from 'jotai';

import usePageOverlay from '@/hooks/usePageOverLay';
import { topMenuState } from '@/jotai/atoms';

import TafseerPopup from './TafseerPopup';

type Props = {
  index: number;
  dimensions: { customPageWidth: number; customPageHeight: number };
};

export default function PageOverlay({ index, dimensions }: Props) {
  const [selectedAya, setSelectedAya] = useState({ aya: 0, surah: 0 });
  const [show, setShow] = useState<boolean>(false);
  const setShowTopMenu = useSetAtom(topMenuState);

  const handleAyaClick = ({ aya, surah }: { aya: number; surah: number }) => {
    setSelectedAya({ aya, surah });
    setShow(true);
  };

  const { overlay, lineHeight } = usePageOverlay({
    index,
    dimensions,
  });

  return (
    <>
      {overlay.map(({ x: top, y: left, width, aya, surah }) => {
        // Adjust positioning for RTL layout
        const adjustedLeft = I18nManager.isRTL
          ? dimensions.customPageWidth - left - width
          : left;

        return (
          <Pressable
            key={`${surah}-${aya}-${top}-${left}-${width}`}
            accessible={true}
            accessibilityLabel={`aya - ${aya} sura - ${surah}`}
            accessibilityRole="button"
            style={[
              styles.overlay,
              {
                top,
                left: adjustedLeft, // Use adjusted left position for RTL
                width,
                height: lineHeight,
                backgroundColor:
                  show && selectedAya.aya === aya && selectedAya.surah === surah
                    ? 'rgba(128, 128, 128, 0.5)'
                    : 'transparent',
              },
            ]}
            onPress={() => setShowTopMenu(true)}
            onLongPress={() => handleAyaClick({ aya, surah })}
          ></Pressable>
        );
      })}
      <TafseerPopup
        show={show}
        setShow={setShow}
        aya={selectedAya.aya}
        surah={selectedAya.surah}
      />
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
  },
});
