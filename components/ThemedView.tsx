import React from 'react';
import { View, type ViewProps } from 'react-native';

import { useThemeColor } from '@/hooks/useThemeColor';

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
};

export const ThemedView = React.forwardRef<View, ThemedViewProps>(
  ({ style, lightColor, darkColor, ...otherProps }, ref) => {
    const backgroundColor = useThemeColor(
      { light: lightColor, dark: darkColor },
      'background',
    );

    return (
      <View ref={ref} style={[{ backgroundColor }, style]} {...otherProps} />
    );
  },
);

ThemedView.displayName = 'ThemedView';
