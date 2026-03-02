import { useColorScheme } from 'react-native';

import { Colors } from '@/constants';

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
