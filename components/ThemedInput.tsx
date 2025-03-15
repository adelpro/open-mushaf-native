import React, { useState } from 'react';
import { StyleSheet, TextInput, type TextInputProps } from 'react-native';

import { useColors } from '@/hooks/useColors';

export type ThemedInputProps = TextInputProps & {
  lightColor?: string;
  darkColor?: string;
  variant?: 'default' | 'outlined' | 'rounded';
};

export function ThemedTextInput({
  style,
  lightColor,
  darkColor,
  variant = 'default',
  ...rest
}: ThemedInputProps) {
  const { primaryColor, secondaryColor, textColor: color } = useColors();
  const [isFocused, setIsFocused] = useState<boolean>(false);

  return (
    <TextInput
      style={[
        {
          color,
          outline: 'none',
          borderColor: isFocused ? primaryColor : secondaryColor,
        },
        variant === 'default' && [
          styles.default,

          { borderBottomWidth: isFocused ? 2 : 1 },
        ],
        variant === 'outlined' && {
          ...styles.outlined,
          borderWidth: isFocused ? 2 : 1,
        },
        variant === 'rounded' && {
          ...styles.rounded,
          borderWidth: isFocused ? 2 : 1,
        },
        style,
      ]}
      placeholderTextColor={secondaryColor}
      onBlur={() => {
        setIsFocused(false);
      }}
      onFocus={() => {
        setIsFocused(true);
      }}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    fontFamily: 'Tajawal_400Regular',
    fontSize: 16,
    padding: 10,
  },
  outlined: {
    fontFamily: 'Tajawal_400Regular',
    fontSize: 16,
    padding: 10,

    borderRadius: 4,
  },
  rounded: {
    fontFamily: 'Tajawal_400Regular',
    fontSize: 16,
    padding: 10,
    borderRadius: 50,
  },
});
