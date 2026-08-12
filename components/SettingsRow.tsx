/**
 * Single settings / More-screen row: icon, title, optional description,
 * trailing control, and optional stacked children (slider or segmented control).
 * Used by the More screen and the Settings screen.
 */

import React from 'react';
import {
  type AccessibilityRole,
  type AccessibilityState,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';

import { Feather } from '@expo/vector-icons';

import { useColors } from '@/hooks';
import { isRTL } from '@/utils';

import { ThemedText } from './ThemedText';

type SettingsRowProps = {
  icon: React.ReactNode;
  title: string;
  description?: string;
  trailing?: React.ReactNode;
  children?: React.ReactNode;
  onPress?: () => void;
  showChevron?: boolean;
  wrapIcon?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityRole?: AccessibilityRole;
  accessibilityState?: AccessibilityState;
};

/**
 * RTL-first settings row with a comfortable touch target.
 */
export function SettingsRow({
  icon,
  title,
  description,
  trailing,
  children,
  onPress,
  showChevron = false,
  wrapIcon = false,
  accessibilityLabel,
  accessibilityHint,
  accessibilityRole,
  accessibilityState,
}: SettingsRowProps) {
  const { iconColor, ivoryColor } = useColors();

  const renderedIcon = wrapIcon ? (
    <View style={[styles.iconWrap, { backgroundColor: ivoryColor }]}>
      {icon}
    </View>
  ) : (
    icon
  );

  const content = (
    <View style={styles.container}>
      <View style={styles.mainRow}>
        <View style={styles.labelBlock}>
          <View style={styles.titleRow}>
            {renderedIcon}
            <ThemedText type="defaultSemiBold" style={styles.title}>
              {title}
            </ThemedText>
          </View>
          {description ? (
            <ThemedText
              style={[
                styles.description,
                {
                  color: iconColor,
                  paddingStart: wrapIcon ? 50 : 34,
                },
              ]}
            >
              {description}
            </ThemedText>
          ) : null}
        </View>
        <View style={styles.trailing}>
          {trailing}
          {showChevron ? (
            <Feather
              name={isRTL ? 'chevron-left' : 'chevron-right'}
              size={20}
              color={iconColor}
              accessibilityElementsHidden
              importantForAccessibility="no"
            />
          ) : null}
        </View>
      </View>
      {children ? <View style={styles.children}>{children}</View> : null}
    </View>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole={accessibilityRole ?? 'button'}
        accessibilityLabel={accessibilityLabel ?? title}
        accessibilityHint={accessibilityHint}
        accessibilityState={accessibilityState}
        style={({ pressed }) => [pressed && styles.pressed]}
      >
        {content}
      </Pressable>
    );
  }

  return (
    <View
      accessibilityRole={accessibilityRole}
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityHint={accessibilityHint}
      accessibilityState={accessibilityState}
    >
      {content}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 14,
    paddingVertical: 14,
    minHeight: 56,
    gap: 10,
  },
  mainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  labelBlock: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    flexShrink: 1,
    fontFamily: 'Tajawal_700Bold',
    fontSize: 16,
    lineHeight: 24,
  },
  description: {
    fontFamily: 'Tajawal_400Regular',
    fontSize: 13,
    lineHeight: 20,
  },
  trailing: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flexShrink: 0,
  },
  children: {
    width: '100%',
  },
  pressed: {
    opacity: 0.72,
  },
});
