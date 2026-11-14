import HTMLView from 'react-native-htmlview';

import { useColors } from '@/hooks';

import { ThemedView } from '../ThemedView';

export function TafseerHtml({ html }: { html: string }) {
  const { textColor } = useColors();
  const textStyle = {
    color: textColor,
    fontFamily: 'Tajawal_400Regular',
    fontSize: 16,
    lineHeight: 24,
    backgroundColor: 'transparent',
  };
  return (
    <ThemedView style={{ flex: 1 }}>
      <HTMLView
        value={html}
        style={{
          paddingHorizontal: 10,
          paddingVertical: 5,
          backgroundColor: 'transparent',
        }}
        stylesheet={{
          div: textStyle,
          p: { ...textStyle, flexDirection: 'row' },
        }}
        addLineBreaks={false}
      />
    </ThemedView>
  );
}
