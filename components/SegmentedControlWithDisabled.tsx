import React, { useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';

import { useColors } from '@/hooks';
import { SegmentedControlProps } from '@/types';

import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

/**
 * An extended version of the `SegmentedControl` designed specifically to restrict access
 * to the very first tab index, rendering it functionally unusable and dynamically styling it.
 *
 * @param props - Mapped stylistic hooks and handlers bounding the tabs.
 * @returns A bordered horizontal toggle block tracking disabled arrays.
 */
export function SegmentedControlWithDisabled({
  options,
  onSelectionChange,
  initialSelectedIndex = 0,
  activeColor = '#007AFF',
  textColor = '#000',
  activeTextColor = '#fff',
  disabledTextColor = '#999',
  activeDisabledColor = '#E0E0E0',
  disabledIndices = [],
}: SegmentedControlProps) {
  // Default to -1;
  const [selectedIndex, setSelectedIndex] = useState(
    initialSelectedIndex !== undefined ? initialSelectedIndex : -1,
  );
  const { ivoryColor } = useColors();

  // Sync internal state when the prop changes (e.g. async storage hydration
  // or external mutation of the underlying atom after mount).
  useEffect(() => {
    setSelectedIndex(
      initialSelectedIndex !== undefined ? initialSelectedIndex : -1,
    );
  }, [initialSelectedIndex]);

  const handlePress = (index: number) => {
    setSelectedIndex(index);
    onSelectionChange(index);
  };

  return (
    <ThemedView style={[styles.container, { backgroundColor: ivoryColor }]}>
      {options.map((option, index) => {
        const isDisabled = disabledIndices.includes(index);
        return (
          <TouchableOpacity
            key={index}
            style={[
              styles.option,
              index === selectedIndex &&
                !isDisabled && { backgroundColor: activeColor },
              index === selectedIndex &&
                isDisabled && { backgroundColor: activeDisabledColor },
            ]}
            onPress={() => !isDisabled && handlePress(index)}
            accessibilityLabel={option}
            accessibilityRole="radio"
            accessibilityState={{
              selected: index === selectedIndex,
              disabled: isDisabled,
            }}
          >
            <ThemedText
              style={[
                styles.optionText,
                {
                  color: isDisabled
                    ? disabledTextColor
                    : index === selectedIndex
                      ? activeTextColor
                      : textColor,
                },
              ]}
              numberOfLines={2}
            >
              {option}
            </ThemedText>
          </TouchableOpacity>
        );
      })}
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
