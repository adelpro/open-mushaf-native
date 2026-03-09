import { StyleSheet, Text, type TextProps } from 'react-native';

import { useThemeColor } from '@/hooks/useThemeColor';

/**
 * Props for the ThemedText component.
 * Extends the default React Native `TextProps`.
 */
export type ThemedTextProps = TextProps & {
  /** Optional override for the light theme color. */
  lightColor?: string;
  /** Optional override for the dark theme color. */
  darkColor?: string;
  /** Stylistic variant determining the font size and weight. */
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link';
};

/**
 * A customized text component that automatically adapts its color based on the current theme.
 * Supports a variety of typographic styles like titles, links, and regular text.
 *
 * @param props - Mapped text properties and stylistic variants.
 * @returns A uniquely styled `<Text>` element tied to the user's theme setting.
 */
export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  ...rest
}: ThemedTextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');

  return (
    <Text
      style={[
        { color },
        type === 'default' ? styles.default : undefined,
        type === 'title' ? styles.title : undefined,
        type === 'defaultSemiBold' ? styles.defaultSemiBold : undefined,
        type === 'subtitle' ? styles.subtitle : undefined,
        type === 'link' ? styles.link : undefined,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    fontFamily: 'Tajawal_400Regular',
    fontSize: 16,
    lineHeight: 24,
  },
  defaultSemiBold: {
    fontFamily: 'Tajawal_400Regular',
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
  },
  title: {
    fontFamily: 'Tajawal_700Bold',
    fontSize: 32,
    fontWeight: 'bold',
    lineHeight: 32,
  },
  subtitle: {
    fontFamily: 'Tajawal_700Bold',
    fontSize: 20,
    fontWeight: 'bold',
  },
  link: {
    fontFamily: 'Tajawal_400Regular',
    lineHeight: 30,
    fontSize: 16,
    color: '#0a7ea4',
  },
});
