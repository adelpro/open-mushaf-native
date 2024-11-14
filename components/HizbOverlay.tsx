import { StyleSheet } from 'react-native';

import { Image } from 'expo-image';

import specs from '@/assets/quran-metadata/mushaf-elmadina-warsh-azrak/specs.json';
import useHizbOverlay from '@/hooks/useHizbOverlay';
import { getDimensionCoeff } from '@/utils';

import { ThemedView } from './ThemedView';

export default function HizbOverlay({
  index,
  dimensions,
}: {
  index: number;
  dimensions: { customPageWidth: number; customPageHeight: number };
}) {
  const { ayaMarker } = useHizbOverlay(index);
  const { customPageHeight, customPageWidth } = dimensions;

  const { defaultPageHeight } = specs;

  const heightCoeff = getDimensionCoeff({
    defaultDimension: defaultPageHeight,
    customDimension: customPageHeight,
  });

  const top: number = ayaMarker ? ayaMarker[3] * heightCoeff + 20 : 0;
  const left = customPageWidth - 40;

  return ayaMarker ? (
    <ThemedView style={[styles.hizbMarker, { top, left }]}>
      <Image
        source={require('../assets/images/hizb-marker.png')}
        style={styles.hizbImage}
      />
    </ThemedView>
  ) : null;
}

const styles = StyleSheet.create({
  hizbMarker: {
    position: 'absolute',
    zIndex: 10,
    height: 30,
    width: 30,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  hizbImage: { width: 30, height: 30, resizeMode: 'contain' },
});
