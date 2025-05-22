import React from 'react';

import {
  SafeAreaView,
  type SafeAreaViewProps,
} from 'react-native-safe-area-context';

import { useThemeColor } from '@/hooks/useThemeColor';

export type ThemedSafeAreaViewProps = SafeAreaViewProps & {
  lightColor?: string;
  darkColor?: string;
  disableTopInset?: boolean;
};

export const ThemedSafeAreaView = React.forwardRef<
  React.ComponentRef<typeof SafeAreaView>,
  ThemedSafeAreaViewProps
>(({ style, lightColor, darkColor, disableTopInset, ...otherProps }, ref) => {
  const backgroundColor = useThemeColor(
    { light: lightColor, dark: darkColor },
    'background',
  );
  return (
    <SafeAreaView
      ref={ref}
      style={[{ backgroundColor }, style]}
      edges={disableTopInset ? ['left', 'right', 'bottom'] : undefined}
      {...otherProps}
    />
  );
});

ThemedSafeAreaView.displayName = 'ThemedSafeAreaView';
