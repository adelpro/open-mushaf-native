import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';

import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

interface BaseProps {
  options: string[];
  onSelectionChange: (selectedIndex: number) => void;
  initialSelectedIndex?: number;
  activeColor?: string;
  textColor?: string;
  activeTextColor?: string;
  disabledTextColor?: string;
  activeDisabledColor?: string;
}

export default function SegmentedControlWithDisabled({
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
      {options.map((option, index) => (
        <TouchableOpacity
          key={index}
          style={[
            styles.option,
            index === selectedIndex &&
              index !== 0 && { backgroundColor: activeColor },
            index === selectedIndex &&
              index === 0 && { backgroundColor: activeDisabledColor },
          ]}
          onPress={() => handlePress(index)}
        >
          <ThemedText
            style={[
              styles.optionText,
              {
                color:
                  index === 0
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
