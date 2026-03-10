import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';

import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

/**
 * Base properties configuring the native-looking segment control widget.
 */
interface BaseProps {
  /** Text labels specifying the toggles available. */
  options: string[];
  /** Handler fired upon tapping a valid segment. */
  onSelectionChange: (selectedIndex: number) => void;
  /** Optionally sets an initially highlighted index block (-1 for no default selection). */
  initialSelectedIndex?: number;
  /** Theme styling overlay color when the chip is active. */
  activeColor?: string;
  /** Standard text tint before active selection. */
  textColor?: string;
  /** Inner tint color for active text selections. */
  activeTextColor?: string;
}

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
}: BaseProps) {
  const [selectedIndex, setSelectedIndex] = useState(initialSelectedIndex);

  const handlePress = (index: number) => {
    setSelectedIndex(index);
    onSelectionChange(index);
  };

  return (
    <ThemedView style={styles.container}>
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
