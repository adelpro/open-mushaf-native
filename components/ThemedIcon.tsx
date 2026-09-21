import React, { ComponentType } from 'react';
import { StyleProp, ViewStyle } from 'react-native';

import { SvgProps } from 'react-native-svg';

import { useColors } from '@/hooks';
import { ButtonVariant } from '@/types';
import { buttonVariantStyles } from '@/utils';

interface ThemedIconProps {
  iconStyle?: StyleProp<ViewStyle>;
  icon: ComponentType<SvgProps>;
  variant?: ButtonVariant;
  disabled?: boolean;
  iconSize?: number;
}

export function ThemedIcon({
  iconStyle = undefined,
  icon: Icon,
  variant = 'default',
  disabled = false,
  iconSize = 24,
}: ThemedIconProps) {
  const colors = useColors();
  const variantStyles = buttonVariantStyles[variant](colors);
  const color = disabled ? colors.disabledIconColor : variantStyles.color;

  return (
    <Icon style={iconStyle} width={iconSize} height={iconSize} color={color} />
  );
}
