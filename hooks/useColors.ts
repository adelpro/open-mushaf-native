import { useColorScheme } from 'react-native';

import { Colors } from '@/constants';

export const useColors = () => {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  const backgroundColor = Colors[colorScheme ?? 'light'].background;
  const tintColor = Colors[colorScheme ?? 'light'].tint;
  const textColor = Colors[colorScheme ?? 'light'].text;
  const iconColor = Colors[colorScheme ?? 'light'].icon;
  const primaryColor = Colors[colorScheme ?? 'light'].primary;
  const primaryLightColor = Colors[colorScheme ?? 'light'].primaryLight;
  const secondaryColor = Colors[colorScheme ?? 'light'].secondary;
  const cardColor = isDarkMode ? '#1E1E1E' : '#F7F7F7';

  return {
    backgroundColor,
    tintColor,
    textColor,
    iconColor,
    primaryColor,
    primaryLightColor,
    secondaryColor,
    cardColor,
  };
};
