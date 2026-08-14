import { Colors } from '@/constants';

import { useAppColorScheme } from './useAppColorScheme';

/**
 * Hook to retrieve the current application theme colors.
 * Follows the persisted app appearance preference (dark / light / system).
 *
 * @returns An object containing all theme color values (e.g., background, primary, text).
 */
export const useColors = () => {
  const colorScheme = useAppColorScheme();
  const theme = colorScheme === 'dark' ? Colors.dark : Colors.light;

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
