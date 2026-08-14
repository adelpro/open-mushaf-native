/**
 * Section heading for grouped settings and More-screen categories.
 * Used by the More screen and the Settings screen.
 */

import React from 'react';
import { StyleSheet, View } from 'react-native';

import { Feather } from '@expo/vector-icons';

import { useAppColorScheme, useColors } from '@/hooks';

import { ThemedText } from './ThemedText';

interface SettingsSectionProps {
  /** Arabic section title shown next to the optional icon. */
  title: string;
  /** Optional Feather icon name rendered in the brand primary color. */
  icon?: keyof typeof Feather.glyphMap;
  children: React.ReactNode;
}

/**
 * Renders a labeled settings group with consistent RTL spacing.
 */
export const SettingsSection = ({
  title,
  icon,
  children,
}: SettingsSectionProps) => {
  const { primaryColor, primaryLightColor } = useColors();
  const colorScheme = useAppColorScheme();
  const accentColor = colorScheme === 'dark' ? primaryLightColor : primaryColor;

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        {icon ? (
          <Feather
            name={icon}
            size={16}
            color={accentColor}
            accessibilityElementsHidden
            importantForAccessibility="no"
          />
        ) : null}
        <ThemedText
          accessibilityRole="header"
          style={[styles.title, { color: accentColor }]}
        >
          {title}
        </ThemedText>
      </View>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    width: '100%',
    marginBottom: 24,
    gap: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 4,
  },
  title: {
    fontFamily: 'Tajawal_700Bold',
    fontSize: 15,
    lineHeight: 22,
  },
});
