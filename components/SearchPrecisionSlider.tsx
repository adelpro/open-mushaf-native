import React from 'react';
import { StyleSheet, View } from 'react-native';

import { useAtom } from 'jotai/react';

import { useColors } from '@/hooks';
import { aiSearchPrecision } from '@/jotai/atoms';

import { AwesomeSlider } from './AwesomeSlider';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

/**
 * Controls the AI semantic-search precision (0..1) via the shared AwesomeSlider.
 *
 * Shown only in AI mode. The value is persisted in the `aiSearchPrecision`
 * atom and mapped downstream to the dense path's cosine floor + top
 * percentile: «أوسع» returns more, loosely-related verses; «أدق» returns
 * fewer, strongly-related ones.
 */
export function SearchPrecisionSlider() {
  const [precision, setPrecision] = useAtom(aiSearchPrecision);
  const { primaryColor, cardColor } = useColors();

  const label = precision < 0.35 ? 'أوسع' : precision < 0.65 ? 'متوازن' : 'أدق';

  return (
    <ThemedView style={[styles.container, { backgroundColor: cardColor }]}>
      <View style={styles.header}>
        <ThemedText style={styles.title}>دقة البحث الدلالي</ThemedText>
        <ThemedText style={styles.level}>({label})</ThemedText>
      </View>
      <AwesomeSlider
        value={precision}
        minimumValue={0}
        maximumValue={1}
        onValueChange={setPrecision}
        primaryColor={primaryColor}
      />
      <View style={styles.endpoints}>
        <ThemedText style={styles.endpoint}>أوسع</ThemedText>
        <ThemedText style={styles.endpoint}>أدق</ThemedText>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  title: {
    fontSize: 13,
    fontWeight: '600',
  },
  level: {
    fontSize: 12,
  },
  endpoints: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  endpoint: {
    fontSize: 11,
    opacity: 0.7,
  },
});
