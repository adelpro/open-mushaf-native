import React, { useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';

import { useColors } from '@/hooks';

import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { SegmentedControlProps } from '../types';

/**
 * An iOS-style Segmented Control component rebuilt manually to enforce RTL and custom coloring.
 * Useful for toggling strict enumerators (e.g. active Riwaya, search scopes).
 *
 * @param props - Custom presentation and callback config wrapped in `BaseProps`.
 * @returns An interactive tab strip component row.
 */
export function SegmentedControl({
  options,
  onSelectionChange,
  initialSelectedIndex = -1,
  activeColor = '#007AFF',
  textColor = '#000',
  activeTextColor = '#fff',
}: SegmentedControlProps) {
  const [selectedIndex, setSelectedIndex] = useState(initialSelectedIndex);
  const { ivoryColor } = useColors();

  // Sync internal state when the prop changes (e.g. async storage hydration
  // or external mutation of the underlying atom after mount).
  useEffect(() => {
    setSelectedIndex(initialSelectedIndex);
  }, [initialSelectedIndex]);

  const handlePress = (index: number) => {
    setSelectedIndex(index);
    onSelectionChange(index);
  };

  return (
    <ThemedView style={[styles.container, { backgroundColor: ivoryColor }]}>
      {options.map((option, index) => (
        <TouchableOpacity
          key={index}
          style={[
            styles.option,
            index === selectedIndex && { backgroundColor: activeColor },
          ]}
          onPress={() => handlePress(index)}
          accessibilityLabel={option}
          accessibilityRole="radio"
          accessibilityState={{ selected: index === selectedIndex }}
        >
          <ThemedText
            style={[
              styles.optionText,
              {
                color: index === selectedIndex ? activeTextColor : textColor,
              },
            ]}
            numberOfLines={2}
          >
            {option}
          </ThemedText>
        </TouchableOpacity>
      ))}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: 8,
    overflow: 'hidden',
  },
  option: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 4,
    minHeight: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionText: {
    fontSize: 14,
    fontFamily: 'Tajawal_500Medium',
    fontWeight: '400',
    textAlign: 'center',
  },
});
