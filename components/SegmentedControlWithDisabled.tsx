import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';

import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

/**
 * Props required for rendering a segmented selector supporting disabled tabs.
 */
interface BaseProps {
  /** An array of string labels displaying the segment options. */
  options: string[];
  /** Callback notifying parent of the newly selected index position. */
  onSelectionChange: (selectedIndex: number) => void;
  /** Numeric offset representing the active tab on load. */
  initialSelectedIndex?: number;
  /** Thematic highlight background for the active toggle. */
  activeColor?: string;
  /** Non-selected text font color. */
  textColor?: string;
  /** Font color inside an actively toggled component. */
  activeTextColor?: string;
  /** Text color representing the disabled segment. */
  disabledTextColor?: string;
  /** Explicit background color for a disabled button that is active. */
  activeDisabledColor?: string;
}

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
}: BaseProps) {
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
