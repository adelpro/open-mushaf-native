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
  const [selectedIndex, setSelectedIndex] = useState(
    initialSelectedIndex !== undefined ? initialSelectedIndex : -1,
  );

  const handlePress = (index: number) => {
    // إذا كان العنصر هو الأول (index === 0) وهو معطل برمجياً في منطقك
    // يمكننا إضافة شرط هنا لمنع التغيير إذا أردت، لكن سأبقي المنطق كما هو مع تحسين الوصول
    setSelectedIndex(index);
    onSelectionChange(index);
  };

  return (
    <ThemedView
      style={styles.container}
      // تحسين الوصول للحاوية الأساسية
      accessible={true}
      accessibilityRole="tablist" // يعامل المجموعة كقائمة تبويبات أو اختيارات
    >
      {options.map((option, index) => {
        const isSelected = index === selectedIndex;
        const isDisabled = index === 0; // بناءً على منطق الكود الأصلي بأن العنصر 0 هو المعطل

        return (
          <TouchableOpacity
            key={index}
            style={[
              styles.option,
              isSelected && !isDisabled && { backgroundColor: activeColor },
              isSelected &&
                isDisabled && { backgroundColor: activeDisabledColor },
            ]}
            onPress={() => handlePress(index)}
            // --- تحسينات الوصول ---
            accessible={true}
            accessibilityRole="tab" // يعامل كل خيار كتبويب
            accessibilityLabel={option}
            accessibilityState={{
              selected: isSelected,
              disabled: isDisabled,
            }}
            accessibilityHint={
              isDisabled
                ? 'هذا الخيار غير متاح حالياً'
                : `اضغط لاختيار ${option}`
            }
            // -----------------------
          >
            <ThemedText
              style={[
                styles.optionText,
                {
                  color: isDisabled
                    ? disabledTextColor
                    : isSelected
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
    // إضافة ارتفاع ثابت للحاوية لضمان محاذاة العناصر
    height: 50,
    marginVertical: 10,
  },
  option: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionText: {
    fontSize: 16,
    fontFamily: 'Tajawal_500Medium', // استخدام خط المشروع الموحد
    textAlign: 'center',
  },
});
