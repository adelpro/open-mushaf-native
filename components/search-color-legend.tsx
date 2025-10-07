import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useColors } from '@/hooks/use-colors';

export default function SearchColorLegend() {
  const { directColor, relatedColor, fuzzyColor, textColor } = useColors();

  const items = [
    { color: directColor, label: 'مطابق' }, // Exact match
    { color: relatedColor, label: 'صرفيّ (جذر/صيغة)' }, // Root or lemma match
    { color: fuzzyColor, label: 'تقريبي' }, // Fuzzy/approximate match
  ];

  return (
    <View style={styles.container}>
      {items.map((item) => (
        <View key={item.label} style={styles.item}>
          <View style={[styles.circle, { backgroundColor: item.color }]} />
          <Text style={[styles.label, { color: textColor }]}>{item.label}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 6,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  circle: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  label: {
    fontSize: 12,
    opacity: 0.8,
  },
});
