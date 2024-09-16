import React from 'react';
import { StyleSheet } from 'react-native';

import usePageOverlay from '@/hooks/usePageOverLay';

import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

type Props = {
  index: number;
  dimensions: { customPageWidth: number; customPageHeight: number };
};

export default function PageOverlay({ index, dimensions }: Props) {
  // TODO add selected aya
  // TODO add show tafseer

  const { overlay } = usePageOverlay({ index, dimensions });
  console.log('overlay', overlay);
  return (
    <ThemedView style={styles.container}>
      <ThemedText>overlay</ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
});
