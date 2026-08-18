/**
 * Compact labeled icon button used in the TopMenu actions row
 * (daily progress, navigation, search, fullscreen).
 *
 * Used only by `components/TopMenu/Actions.tsx`.
 */
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

import { styles } from './styles';

interface ActionButtonProps {
  label: string;
  accessibilityLabel: string;
  accessibilityHint?: string;
  accessibilityState?: { expanded?: boolean };
  onPress: () => void;
  iconBackground: string;
  labelColor: string;
  children: React.ReactNode;
  compact: boolean;
}

export function ActionButton(props: ActionButtonProps) {
  const {
    label,
    accessibilityLabel,
    accessibilityHint,
    accessibilityState,
    onPress,
    iconBackground,
    labelColor,
    children,
    compact,
  } = props;

  return (
    <TouchableOpacity
      style={styles.actionButton}
      onPress={onPress}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityRole="button"
      accessibilityState={accessibilityState}
    >
      <View
        style={[styles.actionIconWrap, { backgroundColor: iconBackground }]}
      >
        {children}
      </View>
      {!compact && (
        <Text
          style={[styles.actionLabel, { color: labelColor }]}
          numberOfLines={1}
        >
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
}
