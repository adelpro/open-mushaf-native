import { useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';

import usePageOverlay from '@/hooks/usePageOverLay';

import { ThemedView } from './ThemedView';

type Props = {
  index: number;
  dimensions: { customPageWidth: number; customPageHeight: number };
};

export default function PageOverlay({ index, dimensions }: Props) {
  // TODO fix zindex with iamges and transparency
  // TODO add show tafseer

  const [selectedAya, setSelectedAya] = useState({ aya: 0, surah: 0 });
  const [show, setShow] = useState(false);

  const handleAyaClick = ({ aya, surah }: { aya: number; surah: number }) => {
    setSelectedAya({ aya, surah });
    setShow(true);
  };

  const { overlay, lineHeight } = usePageOverlay({
    index,
    dimensions,
  });
  return (
    <ThemedView style={styles.container}>
      {overlay.map(({ x: top, y: left, width, aya, surah }) => (
        <Pressable
          key={`${surah}-${aya}-${top}-${left}-${width}`}
          accessible={true}
          accessibilityLabel={`aya - ${aya} sura - ${surah}`}
          accessibilityRole="button"
          style={{
            position: 'absolute',
            top,
            left,
            width,
            height: lineHeight,
            backgroundColor:
              show && selectedAya.aya === aya && selectedAya.surah === surah
                ? 'rgba(128, 128, 128, 0.5)'
                : 'transparent',
          }}
          onPress={() => handleAyaClick({ aya, surah })}
        />
      ))}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    height: '100%',
    width: '100%',
  },
  overlay: {
    position: 'absolute',
  },
});
