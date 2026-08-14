/**
 * Row body pieces for SettingsRow: icon, main line, and optional stacked
 * children. Kept in a separate module so the parent row stays small.
 */

import React from 'react';
import {
  type AccessibilityRole,
  type AccessibilityState,
  View,
} from 'react-native';

import { Feather } from '@expo/vector-icons';

import { useAppColorScheme, useColors } from '@/hooks';

import { styles } from './settingsRowStyles';
import { ThemedText } from './ThemedText';

export interface SettingsRowOptions {
  /** Render the icon inside a tinted rounded square. */
  wrapIcon?: boolean;
  /** Render a left-pointing (RTL) chevron after the trailing slot. */
  showChevron?: boolean;
}

export interface SettingsRowAccessibility {
  label?: string;
  hint?: string;
  role?: AccessibilityRole;
  state?: AccessibilityState;
}

/**
 * Renders the row icon, optionally inside a tinted rounded square.
 */
export const SettingsRowIcon = ({
  icon,
  wrapIcon,
}: {
  icon: React.ReactNode;
  wrapIcon: boolean;
}) => {
  const { primaryColor, primaryLightColor } = useColors();
  const colorScheme = useAppColorScheme();
  const accentColor = colorScheme === 'dark' ? primaryLightColor : primaryColor;

  if (!wrapIcon) {
    return icon;
  }

  return (
    <View style={[styles.iconWrap, { backgroundColor: `${accentColor}22` }]}>
      {icon}
    </View>
  );
};

/**
 * Renders the row main line: icon | title/description | trailing controls.
 */
export const SettingsRowMain = ({
  icon,
  title,
  description,
  trailing,
  showChevron,
  wrapIcon,
}: {
  icon: React.ReactNode;
  title: string;
  description?: string;
  trailing?: React.ReactNode;
  showChevron: boolean;
  wrapIcon: boolean;
}) => {
  const { iconColor } = useColors();

  return (
    <View style={styles.mainRow}>
      <SettingsRowIcon icon={icon} wrapIcon={wrapIcon} />
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
  );
};

/**
 * Renders the row body: main line plus optional stacked children.
 */
export const SettingsRowContent = ({
  icon,
  title,
  description,
  trailing,
  children,
  options,
}: {
  icon: React.ReactNode;
  title: string;
  description?: string;
  trailing?: React.ReactNode;
  children?: React.ReactNode;
  options: SettingsRowOptions;
}) => {
  const { showChevron = false, wrapIcon = false } = options;

  return (
    <View style={styles.container}>
      <SettingsRowMain
        icon={icon}
        title={title}
        description={description}
        trailing={trailing}
        showChevron={showChevron}
        wrapIcon={wrapIcon}
      />
      {children ? <View style={styles.children}>{children}</View> : null}
    </View>
  );
};
