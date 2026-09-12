import React, { CSSProperties, FunctionComponent, SVGProps } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  type TouchableOpacityProps,
} from 'react-native';

import { useColors } from '@/hooks';

/**
 * Expanding default properties native to `TouchableOpacityProps`.
 * Added standardized coloring parameters referencing Jotai styling atoms.
 */
export type ThemedButtonProps = TouchableOpacityProps & {
  title: string;
  icon?: FunctionComponent<SVGProps<SVGSVGElement>>;
  iconStyle?: CSSProperties;
  iconSize?: number;
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
export function ThemedAppButton({
  style,
  title,
  icon: Icon = undefined,
  iconStyle = undefined,
  iconSize = 24,
  lightColor,
  darkColor,
  variant = 'default',
  children,
  ...rest
}: ThemedButtonProps) {
  const {
    primaryColor,
    secondaryColor,
    dangerColor,
    dangerLightColor,
    backgroundColor,
  } = useColors();
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: primaryColor,
          borderColor: primaryColor,
          color: 'white',
        };
      case 'secondary':
        return {
          backgroundColor: secondaryColor,
          borderColor: secondaryColor,
          color: 'white',
        };
      case 'outlined-primary':
        return {
          borderColor: primaryColor,
          color: primaryColor,
        };
      case 'outlined-secondary':
        return {
          borderColor: secondaryColor,
          color: secondaryColor,
        };
      case 'danger':
        return {
          backgroundColor: dangerColor,
          borderColor: dangerColor,
          color: 'white',
        };
      case 'danger-secondary':
        return {
          backgroundColor: dangerLightColor,
          borderColor: dangerLightColor,
          color: 'white',
        };
      case 'outlined-danger':
        return {
          backgroundColor: 'transparent',
          borderColor: dangerColor,
          color: dangerColor,
        };
      case 'outlined-danger-secondary':
        return {
          backgroundColor: 'transparent',
          borderColor: dangerLightColor,
          color: dangerLightColor,
        };
      case 'default':
      default:
        return {
          backgroundColor: 'blue',
          borderColor: 'blue',
          color: 'white',
        };
    }
  };

  const variantStyles = getVariantStyles();

  return (
    <TouchableOpacity
      accessibilityRole="button"
      style={[
        {
          backgroundColor: variantStyles.backgroundColor ?? backgroundColor,
          borderColor: variantStyles.borderColor,
          borderWidth: 1,
        },
        styles.base,
        style,
      ]}
      activeOpacity={0.8}
      {...rest}
    >
      <Text style={[styles.text, { color: variantStyles.color }]}>{title}</Text>
      {Icon && (
        <Icon
          style={iconStyle}
          width={iconSize}
          height={iconSize}
          color={variantStyles.color}
        />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 8,
    height: 50,
    width: '100%',
    maxWidth: 640,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0px 5px 5px rgba(0, 0, 0, 0.2)',
    elevation: 5,
  },
  text: {
    fontFamily: 'Tajawal_500Medium',
    fontSize: 20,
    marginTop: 5,
  },
});
