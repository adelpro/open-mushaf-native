import { useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { useSetRecoilState } from 'recoil';

import usePageOverlay from '@/hooks/usePageOverLay';
import { topMenuState } from '@/recoil/atoms';

import TafseerPopup from './TafseerPopup';

type Props = {
  index: number;
  dimensions: { customPageWidth: number; customPageHeight: number };
};

export default function PageOverlay({ index, dimensions }: Props) {
  // TODO add show tafseer

  const [selectedAya, setSelectedAya] = useState({ aya: 0, surah: 0 });
  const [show, setShow] = useState<boolean>(false);
  const setShowTopMenu = useSetRecoilState(topMenuState);

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
      {overlay.map(({ x: top, y: left, width, aya, surah }) => (
        <Pressable
          key={`${surah}-${aya}-${top}-${left}-${width}`}
          accessible={true}
          accessibilityLabel={`aya - ${aya} sura - ${surah}`}
          accessibilityRole="button"
          style={[
            styles.overlay,
            {
              top,
              left,
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
        >
          {/*  <ThemedText>{`aya - ${aya} sura - ${surah}`}</ThemedText> */}
        </Pressable>
      ))}
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