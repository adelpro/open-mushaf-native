/**
 * Stack header back control for this RTL-first app.
 * Renders a right-pointing chevron (→) so "back" matches Arabic navigation.
 * Used by the root Stack and the More Stack via screenOptions.headerLeft.
 */

import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { useColors } from '@/hooks';

type RtlHeaderBackButtonProps = {
  tintColor?: string;
  canGoBack?: boolean;
};

/**
 * Replaces the default LTR back arrow on stack screens.
 */
export const RtlHeaderBackButton = ({
  tintColor,
  canGoBack,
}: RtlHeaderBackButtonProps) => {
  const router = useRouter();
  const { textColor } = useColors();

  if (canGoBack === false) {
    return null;
  }

  const handleBack = () => router.back();

  return (
    <Pressable
      onPress={handleBack}
      accessibilityRole="button"
      accessibilityLabel="رجوع"
      hitSlop={12}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
    >
      <View style={styles.ltr}>
        <Feather
          name="chevron-right"
          size={28}
          color={tintColor ?? textColor}
        />
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pressed: {
    opacity: 0.7,
  },
  ltr: {
    direction: 'ltr',
  },
});
