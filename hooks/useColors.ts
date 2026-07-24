import { useColorScheme } from 'react-native';

import { Colors } from '@/constants';

type ThemeName = 'light' | 'dark';

/**
 * Normalize the system color-scheme value (which can be `null`,
 * `'light'`, `'dark'`, or `'unspecified'`) to the two-key `Colors`
 * palette. Anything other than a literal `'dark'` resolves to `'light'`.
 */
function resolveTheme(scheme: ReturnType<typeof useColorScheme>): ThemeName {
  return scheme === 'dark' ? 'dark' : 'light';
}

/**
 * Hook to retrieve the current application theme colors.
 * Automatically adapts to the system's light or dark mode setting.
 *
 * @returns An object containing all theme color values (e.g., background, primary, text).
 */
export const useColors = () => {
  const theme = Colors[resolveTheme(useColorScheme())];

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
