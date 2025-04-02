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
}

export default function SegmentedControl({
  options,
  onSelectionChange,
  initialSelectedIndex = undefined,
  activeColor = '#007AFF',
  textColor = '#000',
  activeTextColor = '#fff',
}: BaseProps) {
  // Default to -1
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
            index === selectedIndex && { backgroundColor: activeColor },
          ]}
          onPress={() => handlePress(index)}
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
