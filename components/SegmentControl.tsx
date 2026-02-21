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
    <ThemedView
      style={styles.container}
      accessible={true}
      accessibilityRole="tablist" // تعريف المجموعة كقائمة تبويبات
    >
      {options.map((option, index) => {
        const isSelected = index === selectedIndex;

        return (
          <TouchableOpacity
            key={index}
            style={[
              styles.option,
              isSelected && { backgroundColor: activeColor },
            ]}
            onPress={() => handlePress(index)}
            // --- خصائص الوصول ---
            accessible={true}
            accessibilityRole="tab"
            accessibilityLabel={option}
            accessibilityState={{ selected: isSelected }}
            accessibilityHint={`اضغط لتفعيل خيار ${option}`}
            // ---------------------
          >
            <ThemedText
              style={[
                styles.optionText,
                {
                  color: isSelected ? activeTextColor : textColor,
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
    marginVertical: 8,
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
    fontFamily: 'Tajawal_500Medium', // توحيد الخط مع هوية التطبيق
    textAlign: 'center',
  },
});
