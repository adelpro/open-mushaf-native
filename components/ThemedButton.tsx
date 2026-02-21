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
  children?: React.ReactNode; // إضافة تعريف للأطفال لضمان توافق الأنواع
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

export function ThemedButton({
  style,
  lightColor,
  darkColor,
  variant = 'default',
  children,
  accessibilityLabel,
  disabled,
  ...rest
}: ThemedButtonProps) {
  const { primaryColor, secondaryColor, dangerColor, dangerLightColor } =
    useColors();
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
          backgroundColor: 'transparent' as const,
          borderColor: dangerColor,
          color: dangerColor,
        };
      case 'outlined-danger-secondary':
        return {
          backgroundColor: 'transparent' as const,
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
  const autoLabel = typeof children === 'string' ? children : undefined;
  return (
    <TouchableOpacity
      style={[
        {
          backgroundColor: variantStyles.backgroundColor,
          borderColor: variantStyles.borderColor,
          borderWidth: 1,
        },
        isPressed && { opacity: 0.8 },
        disabled && { opacity: 0.5 },
        styles.base,
        style,
      ]}
      activeOpacity={0.8}
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
      disabled={disabled}
      // --- خصائص إمكانية الوصول (Accessibility) ---
      accessible={true}
      accessibilityRole="button"
      // ينطق الـ Label الممرر يدوياً، وإذا لم يوجد ينطق النص الموجود داخل الزر
      accessibilityLabel={accessibilityLabel || autoLabel}
      // يخبر المستخدم بحالة الزر (هل هو معطل حالياً؟)
      accessibilityState={{ disabled: !!disabled }}
      // -------------------------------------------

      {...rest}
    >
      <Text
        style={[
          styles.text,
          styles.center,
          { color: variantStyles.color, backgroundColor: 'transparent' },
        ]}
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
