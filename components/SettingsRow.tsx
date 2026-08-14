/**
 * Single settings / More-screen row: icon, title, optional description,
 * trailing control, and optional stacked children (slider or segmented control).
 * Layout is icon | label | trailing so descriptions sit under the title.
 * Used by the More screen and the Settings screen.
 */

import React from 'react';
import { Pressable, View } from 'react-native';

import {
  type SettingsRowAccessibility,
  SettingsRowContent,
  type SettingsRowOptions,
} from './SettingsRowContent';
import { styles } from './settingsRowStyles';

interface SettingsRowProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  trailing?: React.ReactNode;
  children?: React.ReactNode;
  onPress?: () => void;
  options?: SettingsRowOptions;
  accessibility?: SettingsRowAccessibility;
}

/**
 * RTL-first settings row with a comfortable touch target.
 */
export const SettingsRow = ({
  icon,
  title,
  description,
  trailing,
  children,
  onPress,
  ...rest
}: SettingsRowProps) => {
  const { options = {}, accessibility } = rest;

  const content = (
    <SettingsRowContent
      icon={icon}
      title={title}
      description={description}
      trailing={trailing}
      options={options}
    >
      {children}
    </SettingsRowContent>
  );

  const rowAccessibility = {
    accessibilityLabel: accessibility?.label ?? title,
    accessibilityHint: accessibility?.hint,
    accessibilityState: accessibility?.state,
  };

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole={accessibility?.role ?? 'button'}
        {...rowAccessibility}
        style={({ pressed }) => [pressed && styles.pressed]}
      >
        {content}
      </Pressable>
    );
  }

  return (
    <View accessibilityRole={accessibility?.role} {...rowAccessibility}>
      {content}
    </View>
  );
};
