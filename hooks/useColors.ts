import { useColorScheme } from 'react-native';

import { Colors } from '@/constants';

/**
 * Hook to retrieve the current application theme colors.
 * Automatically adapts to the system's light or dark mode setting.
 *
 * @returns An object containing all theme color values (e.g., background, primary, text).
 */
export const useColors = () => {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  return {
    backgroundColor: theme.background,
    tintColor: theme.tint,
    textColor: theme.text,
    iconColor: theme.icon,
    primaryColor: theme.primary,
    primaryLightColor: theme.primaryLight,
    secondaryColor: theme.secondary,
    dangerColor: theme.danger,
    dangerLightColor: theme.dangerLight,
    cardColor: theme.card,
    ivoryColor: theme.ivory,
    tabIconDefaultColor: theme.tabIconDefault,

    // Text Highlight colors
    directColor: theme.directColor,
    relatedColor: theme.relatedColor,
    fuzzyColor: theme.fuzzyColor,
  };
};
