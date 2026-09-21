import React, { ReactNode } from 'react';
import { TouchableOpacity } from 'react-native';

import { useColors } from '@/hooks';
import type { ThemedAppButtonProps } from '@/types';
import { buttonVariantStyles } from '@/utils/buttonVariantStyles';

import { styles } from './ThemedTouchable.styles';

type ThemedTouchableProps = Pick<
  ThemedAppButtonProps,
  'style' | 'variant' | 'disabled' | 'onPress'
> & { children: ReactNode };

export function ThemedTouchable({
  style = {},
  variant = 'default',
  disabled = false,
  children,
  onPress,
}: ThemedTouchableProps) {
  const colors = useColors();
  const variantStyles = buttonVariantStyles[variant](colors);

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
        styles.container,
        style,
      ]}
      activeOpacity={0.8}
      disabled={disabled}
      onPress={onPress}
    >
      {children}
    </TouchableOpacity>
  );
}
