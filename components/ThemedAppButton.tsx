import React, { FC } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';

import type { SvgProps } from 'react-native-svg';

import { useColors } from '@/hooks';
import { buttonVariantStyles } from '@/utils/buttonVariantStyles';

import { ThemedButtonProps } from './ThemedButton';

type ThemedAppButtonProps = ThemedButtonProps &
  (
    | {
        title: string;
        icon?: FC<SvgProps>;
      }
    | {
        title?: string;
        icon: FC<SvgProps>;
      }
  ) & {
    iconStyle?: ViewStyle;
    iconSize?: number;
    disabled?: boolean;
  };

/**
 * A generalized accessible interaction element overriding pure `TouchableOpacity` behaviors
 * matching established color schemas automatically while providing robust touch feedback.
 *
 * @param props - Mapped stylistic hooks.
 * @returns A theme-matching interactive button structure.
 */
export function ThemedAppButton({
  style,
  title = '',
  icon: Icon = undefined,
  iconStyle = undefined,
  iconSize = 24,
  variant = 'default',
  disabled = false,
  ...rest
}: ThemedAppButtonProps) {
  const colors = useColors();

  const variantStyles = buttonVariantStyles[variant](colors);
  const iconColor = disabled ? colors.disabledIconColor : variantStyles.color;

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
        styles.base,
        style,
      ]}
      activeOpacity={0.8}
      disabled={disabled}
      {...rest}
    >
      {!!title && (
        <Text style={[styles.text, { color: variantStyles.color }]}>
          {title}
        </Text>
      )}
      {Icon && (
        <Icon
          style={iconStyle}
          width={iconSize}
          height={iconSize}
          color={iconColor}
        />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 8,
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow:
      Platform.OS === 'web' ? '0px 5px 5px rgba(0, 0, 0, 0.2)' : undefined,
    shadowColor: 'black',
    shadowOpacity: 0.3,
    shadowRadius: 3.5,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    elevation: 5,
  },
  text: {
    fontFamily: 'Tajawal_500Medium',
    fontSize: 20,
    marginTop: 5,
    lineHeight: 25,
  },
});
