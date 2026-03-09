import React from 'react';
import { View, type ViewProps } from 'react-native';

import { useThemeColor } from '@/hooks';

/**
 * Extended View properties to support automated background coloring depending on the active theme.
 */
export type ThemedViewProps = ViewProps & {
  /** Specific background HEX to use in the light mode representation. */
  lightColor?: string;
  /** Specific background HEX to use in the dark mode representation. */
  darkColor?: string;
};

/**
 * A generalized block container injecting automatic background colors mapped
 * directly from the current Jotai-controlled theme state.
 *
 * @param props - Inbound style block and children.
 * @returns A safe `<View>` wrapper.
 */
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
