import React, { useState } from 'react';
import { I18nManager, StyleSheet, TouchableOpacity } from 'react-native';

import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

interface SegmentedControlProps {
  options: string[];
  onSelectionChange: (selectedIndex: number) => void;
  initialSelectedIndex?: number;
  activeColor?: string;
  textColor?: string;
  activeTextColor?: string;
  disabledTextColor?: string;
  activeDisabledColor?: string;
}

const isRTL = I18nManager.isRTL;

export default function SegmentedControl({
  options,
  onSelectionChange,
  initialSelectedIndex = 0,
  activeColor = '#007AFF',
  textColor = '#000',
  activeTextColor = '#fff',
  activeDisabledColor = '#E0E0E0',
  disabledTextColor = '#999',
}: SegmentedControlProps) {
  const [selectedIndex, setSelectedIndex] = useState(initialSelectedIndex);

  const handlePress = (index: number) => {
    setSelectedIndex(index);
    onSelectionChange(index);
  };

  return (
    <ThemedView style={[styles.container]}>
      {options.map((option, index) => (
        <TouchableOpacity
          key={index}
          style={[
            styles.option,
            index === selectedIndex && { backgroundColor: activeColor },
            index === 0 && {
              backgroundColor: activeDisabledColor,
            },
            index === options.length - 1 && styles.lastOption,
          ]}
          onPress={() => handlePress(index)}
        >
          <ThemedText
            style={[
              styles.optionText,
              {
                color:
                  index === selectedIndex
                    ? activeTextColor
                    : index === 0
                      ? disabledTextColor
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
    flexDirection: isRTL ? 'row-reverse' : 'row',
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
    overflow: 'hidden',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  },
  option: {
    flex: 1,
    paddingVertical: 8,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    transform: isRTL ? [{ scaleX: -1 }] : undefined,
  },

  lastOption: {
    borderRightWidth: 0,
  },
  optionText: {
    fontSize: 20,
    padding: 8,
    fontWeight: '400',
    justifyContent: 'center',
    alignItems: 'center',
    alignContent: 'center',
    textAlign: 'center',
  },
});
