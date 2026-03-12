import { useState } from 'react';
import { I18nManager, Pressable, StyleSheet } from 'react-native';

import { useSetAtom } from 'jotai';

import { usePageOverlay } from '@/hooks';
import { topMenuState } from '@/jotai/atoms';
import { triggerImpactHaptic } from '@/utils';

import { TafseerPopup } from './TafseerPopup';

/**
 * Props for the PageOverlay component.
 */
type Props = {
  /** The page number currently being displayed. */
  index: number;
  /** The width and height of the rendered Quran page image. */
  dimensions: { customPageWidth: number; customPageHeight: number };
  /** The offset to apply to the top of the overlay. */
  topOffset?: number;
};

/**
 * Renders an invisible, interactive grid over the static Quran page image.
 * This component maps the physical locations of verses (Ayas) on the image
 * so users can tap or long-press specific verses to open the Tafseer (exegesis) popup.
 *
 * @param props - The page index and image dimensions used to scale the verse positions.
 * @returns A group of invisible, pressable areas placed precisely over the verses.
 */
export function PageOverlay({ index, dimensions, topOffset = 0 }: Props) {
  const [selectedAya, setSelectedAya] = useState({ aya: 0, surah: 0 });
  const [show, setShow] = useState<boolean>(false);
  const setShowTopMenu = useSetAtom(topMenuState);

  const handleAyaClick = ({ aya, surah }: { aya: number; surah: number }) => {
    triggerImpactHaptic();
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
                top: top + topOffset,
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
