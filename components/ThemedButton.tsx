import { useState } from 'react';
import {
  Text,
  TouchableOpacity,
  type TouchableOpacityProps,
} from 'react-native';

import { useColors } from '@/hooks';
import { getButtonVariantStyles } from '@/utils';

import { styles } from './ThemedButton.styles';

/**
 * Expanding default properties native to `TouchableOpacityProps`.
 * Added standardized coloring parameters referencing Jotai styling atoms.
 */
export type ThemedButtonProps = TouchableOpacityProps & {
  lightColor?: string;
  darkColor?: string;
  /** Enforces a standardized stylistic approach via internal switch evaluation. */
  variant?:
    | 'default'
    | 'primary'
    | 'secondary'
    | 'outlined-primary'
    | 'outlined-secondary'
    | 'danger'
    | 'danger-secondary'
    | 'outlined-danger'
    | 'outlined-danger-secondary';
};

/**
 * A generalized accessible interaction element overriding pure `TouchableOpacity` behaviors
 * matching established color schemas automatically while providing robust touch feedback.
 *
 * @param props - Mapped stylistic hooks.
 * @returns A theme-matching interactive button structure.
 */
export function ThemedButton({
  style,
  variant = 'default',
  children,
  ...rest
}: ThemedButtonProps) {
  const colors = useColors();
  const [isPressed, setIsPressed] = useState<boolean>(false);

  const variantStyles = getButtonVariantStyles(variant, colors);

  return (
    <TouchableOpacity
      accessibilityRole="button"
      style={[
        {
          backgroundColor:
            variantStyles.backgroundColor ?? colors.backgroundColor,
          borderColor: variantStyles.borderColor,
          borderWidth: 1,
        },
        isPressed && { opacity: 0.8 },
        styles.base,
        style,
      ]}
      activeOpacity={0.8}
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
      {...rest}
    >
      <Text
        style={[styles.text, styles.center, { color: variantStyles.color }]}
      >
        {children}
      </Text>
    </TouchableOpacity>
  );
}
