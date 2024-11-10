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
  console.log('ayaMarker', ayaMarker);
  const { customPageHeight, customPageWidth } = dimensions;

  const { defaultPageHeight } = specs;

  const heightCoeff = getDimensionCoeff({
    defaultDimension: defaultPageHeight,
    customDimension: customPageHeight,
  });

  const top: number = ayaMarker ? ayaMarker[3] * heightCoeff : 0;
  const left = customPageWidth - 50;

  console.log('top', top, 'left', left);
  return ayaMarker ? (
    <ThemedView
      style={[styles.ayaMarker, { top, left, height: 50, width: 50 }]}
    >
      <Image source={'@/assets/images/marker.webp'} />
    </ThemedView>
  ) : null;
}

const styles = StyleSheet.create({
  ayaMarker: {
    position: 'absolute',
    zIndex: 10,
  },
});
