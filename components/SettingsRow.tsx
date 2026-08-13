/**
 * Single settings / More-screen row: icon, title, optional description,
 * trailing control, and optional stacked children (slider or segmented control).
 * Layout is icon | label | trailing so descriptions sit under the title.
 * Forward chevrons are forced left-pointing (RTL) inside an LTR wrapper
 * so I18nManager / CSS direction cannot flip them.
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

import { useAppColorScheme, useColors } from '@/hooks';

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
  const { iconColor, primaryColor, primaryLightColor } = useColors();
  const colorScheme = useAppColorScheme();
  const accentColor = colorScheme === 'dark' ? primaryLightColor : primaryColor;

  const renderedIcon = wrapIcon ? (
    <View style={[styles.iconWrap, { backgroundColor: `${accentColor}22` }]}>
      {icon}
    </View>
  ) : (
    icon
  );

  const content = (
    <View style={styles.container}>
      <View style={styles.mainRow}>
        {renderedIcon}
        <View style={styles.labelBlock}>
          <ThemedText type="defaultSemiBold" style={styles.title}>
            {title}
          </ThemedText>
          {description ? (
            <ThemedText style={[styles.description, { color: iconColor }]}>
              {description}
            </ThemedText>
          ) : null}
        </View>
        <View style={styles.trailing}>
          {trailing}
          {showChevron ? (
            <View style={styles.chevron}>
              <Feather
                name="chevron-left"
                size={20}
                color={iconColor}
                accessibilityElementsHidden
                importantForAccessibility="no"
              />
            </View>
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
  chevron: {
    direction: 'ltr',
  },
  children: {
    width: '100%',
  },
  pressed: {
    opacity: 0.72,
  },
});
