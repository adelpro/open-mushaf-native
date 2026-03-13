import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';

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
}: SegmentedControlProps) {
  // Default to -1;
  const [selectedIndex, setSelectedIndex] = useState(
    initialSelectedIndex !== undefined ? initialSelectedIndex : -1,
  );

  const handlePress = (index: number) => {
    setSelectedIndex(index);
    onSelectionChange(index);
  };

  return (
    <ThemedView style={styles.container}>
      {options.map((option, index) => {
        const isDisabled = index === 0;
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
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
    overflow: 'hidden',
  },
  option: {
    flex: 1,
    paddingVertical: 8,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionText: {
    fontSize: 16,
    fontWeight: '400',
    textAlign: 'center',
  },
});
