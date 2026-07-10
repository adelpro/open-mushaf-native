import React from 'react';
import {
  Platform,
  Pressable,
  type PressableProps,
  type PressableStateCallbackType,
  StyleSheet,
  Text,
  type ViewStyle,
} from 'react-native';

import { useColors } from '@/hooks';

export type ThemedButtonProps = Omit<PressableProps, 'children'> & {
  lightColor?: string;
  darkColor?: string;
  children?: React.ReactNode;
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

// RN's ViewStyle types only allow 'solid' | 'dotted' | 'dashed' for outlineStyle,
// but RN Web also supports 'none' at runtime. Cast at the boundary instead of
// weakening the whole stylesheet's typing.
const webOutlineNone = { outlineStyle: 'none' } as unknown as ViewStyle;
const webFocusRing = {
  outlineStyle: 'solid',
  outlineWidth: 2,
  outlineColor: 'rgba(255, 255, 255, 0.8)',
  outlineOffset: 2,
} as unknown as ViewStyle;

export function ThemedButton({
  style,
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
        return { borderColor: primaryColor, color: primaryColor };
      case 'outlined-secondary':
        return { borderColor: secondaryColor, color: secondaryColor };
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
        return { backgroundColor: 'blue', borderColor: 'blue', color: 'white' };
    }
  };

  const variantStyles = getVariantStyles();

  return (
    <Pressable
      accessibilityRole="button"
      style={(
        state: PressableStateCallbackType & {
          hovered?: boolean;
          focused?: boolean;
        },
      ) => [
        {
          backgroundColor: variantStyles.backgroundColor ?? backgroundColor,
          borderColor: variantStyles.borderColor,
          borderWidth: 1,
        },
        styles.base,
        Platform.OS === 'web' && webOutlineNone,
        state.pressed && { opacity: 0.8 },
        Platform.OS === 'web' &&
          state.hovered &&
          !state.pressed &&
          styles.hovered,
        Platform.OS === 'web' && state.focused && webFocusRing,
        typeof style === 'function' ? style(state) : style,
      ]}
      {...rest}
    >
      <Text
        style={[styles.text, styles.center, { color: variantStyles.color }]}
      >
        {children}
      </Text>
    </Pressable>
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
  hovered: {
    opacity: 0.9,
    boxShadow: '0px 6px 8px rgba(0, 0, 0, 0.25)',
  },
  text: {
    fontFamily: 'Tajawal_500Medium',
    fontSize: 18,
  },
  center: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
});
