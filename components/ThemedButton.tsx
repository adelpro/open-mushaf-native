import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  type TouchableOpacityProps,
} from 'react-native';

import { useColors } from '@/hooks/useColors';

export type ThemedButtonProps = TouchableOpacityProps & {
  lightColor?: string;
  darkColor?: string;
  variant?:
    | 'default'
    | 'primary'
    | 'secondary'
    | 'outlined-primary'
    | 'outlined-secondary';
};

export function ThemedButton({
  style,
  lightColor,
  darkColor,
  variant = 'default',
  children,
  ...rest
}: ThemedButtonProps) {
  const { primaryColor, secondaryColor } = useColors();
  const [isPressed, setIsPressed] = useState<boolean>(false);

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
          backgroundColor: 'transparent',
          borderColor: primaryColor,
          color: primaryColor,
        };
      case 'outlined-secondary':
        return {
          backgroundColor: 'transparent',
          borderColor: secondaryColor,
          color: secondaryColor,
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
      style={[
        {
          backgroundColor: variantStyles.backgroundColor,
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

const styles = StyleSheet.create({
  base: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    height: 50,
    width: '90%',
    maxWidth: 640,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0px 5px 5px rgba(0, 0, 0, 0.2)',
    elevation: 5,
  },
  text: {
    fontFamily: 'Tajawal_400Regular',
    fontSize: 18,
    fontWeight: 'bold',
  },
  center: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
});
