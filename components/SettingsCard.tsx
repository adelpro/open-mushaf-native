/**
 * Rounded card that groups related settings or More-screen destinations.
 * Inserts hairline dividers between children. Overflow stays visible so
 * toggles are not clipped. Used by More and Settings screens.
 */

import React from 'react';
import { StyleSheet, View } from 'react-native';

import { useColors } from '@/hooks';

interface SettingsCardProps {
  children: React.ReactNode;
}

/**
 * Theme-aware card container for settings rows.
 */
export function SettingsCard({ children }: SettingsCardProps) {
  const { cardColor, iconColor } = useColors();
  const items = React.Children.toArray(children).filter(Boolean);

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: cardColor, borderColor: `${iconColor}28` },
      ]}
    >
      {items.map((child, index) => (
        <React.Fragment key={index}>
          {child}
          {index < items.length - 1 ? (
            <View
              style={[styles.divider, { backgroundColor: `${iconColor}28` }]}
            />
          ) : null}
        </React.Fragment>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginStart: 14,
    marginEnd: 14,
  },
});
