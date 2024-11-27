import { useColorScheme } from 'react-native';

import { Colors } from '@/constants';

export const useColors = () => {
  const colorScheme = useColorScheme();

  const backgroundColor = Colors[colorScheme ?? 'light'].background;
  const tintColor = Colors[colorScheme ?? 'light'].tint;
  const textColor = Colors[colorScheme ?? 'light'].text;
  const iconColor = Colors[colorScheme ?? 'light'].icon;

  return {
    backgroundColor,
    tintColor,
    textColor,
    iconColor,
  };
};
