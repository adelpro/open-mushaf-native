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

interface SettingsRowOptions {
  /** Render the icon inside a tinted rounded square. */
  wrapIcon?: boolean;
  /** Render a left-pointing (RTL) chevron after the trailing slot. */
  showChevron?: boolean;
}

interface SettingsRowAccessibility {
  label?: string;
  hint?: string;
  role?: AccessibilityRole;
  state?: AccessibilityState;
}

interface SettingsRowProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  trailing?: React.ReactNode;
  children?: React.ReactNode;
  onPress?: () => void | Promise<void>;
  options?: SettingsRowOptions;
  accessibility?: SettingsRowAccessibility;
}

/**
 * Renders the row icon, optionally inside a tinted rounded square.
 */
const SettingsRowIcon = ({
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
const SettingsRowMain = ({
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
const SettingsRowContent = ({
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
