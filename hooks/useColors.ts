import { useColorScheme } from 'react-native';

import { Colors } from '@/constants';

export const useColors = () => {
  const colorScheme = useColorScheme();
  const backgroundColor = Colors[colorScheme ?? 'light'].background;
  const tintColor = Colors[colorScheme ?? 'light'].tint;
  const textColor = Colors[colorScheme ?? 'light'].text;
  const iconColor = Colors[colorScheme ?? 'light'].icon;
  const primaryColor = Colors[colorScheme ?? 'light'].primary;
  const primaryLightColor = Colors[colorScheme ?? 'light'].primaryLight;
  const secondaryColor = Colors[colorScheme ?? 'light'].secondary;
  const dangerColor = Colors[colorScheme ?? 'light'].danger;
  const dangerLightColor = Colors[colorScheme ?? 'light'].dangerLight;
  const cardColor = Colors[colorScheme ?? 'light'].card;
  const ivoryColor = Colors[colorScheme ?? 'light'].ivory;

  // Text Highlight colors
  const directColor = Colors[colorScheme ?? 'light'].directColor;
  const relatedColor = Colors[colorScheme ?? 'light'].relatedColor;
  const fuzzyColor = Colors[colorScheme ?? 'light'].fuzzyColor;

  return {
    backgroundColor,
    tintColor,
    textColor,
    iconColor,
    primaryColor,
    primaryLightColor,
    secondaryColor,
    cardColor,
    dangerColor,
    dangerLightColor,
    ivoryColor,

    // Text Highlight colors
    directColor,
    relatedColor,
    fuzzyColor,
  };
};
