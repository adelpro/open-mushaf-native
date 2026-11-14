import { useState } from 'react';
import { Platform, TextInput, type TextInputProps } from 'react-native';

import { useColors } from '@/hooks/useColors';

import { styles } from './ThemedTextInput.styles';

/**
 * Props for the ThemedTextInput component.
 * Combines React Native `TextInputProps` with theme-aware options.
 */
export type ThemedInputProps = TextInputProps & {
  /** Optional override for the light theme text color. */
  lightColor?: string;
  /** Optional override for the dark theme text color. */
  darkColor?: string;
  /** Visual framing style for the input field. */
  variant?: 'default' | 'outlined' | 'rounded';
};

/**
 * A styled text input element handling its own focus management and dynamic coloring.
 * Adjusts border aesthetics automatically based on variant props and theme context.
 *
 * @param props - Form field tracking and custom styling parameters.
 * @returns A state-aware `<TextInput>` matching the application's design system.
 */
export function ThemedTextInput({
  style,
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
          ...Platform.select({
            web: {
              outline: 'none',
            },
          }),
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
