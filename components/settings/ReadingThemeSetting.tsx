import { Pressable } from 'react-native';

import { Feather } from '@expo/vector-icons';
import { useAtom } from 'jotai/react';

import { SegmentedControl, ThemedText, ThemedView } from '@/components';
import { READING_THEME_KEYS, READING_THEME_LABELS } from '@/constants';
import { useColors } from '@/hooks';
import { readingTheme } from '@/jotai/atoms';
import { styles } from '@/styles/screens/settings.styles';

export function ReadingThemeSetting() {
  const { primaryColor, cardColor, iconColor } = useColors();
  const [readingThemeValue, setReadingThemeValue] = useAtom(readingTheme);

  function renderFullWidthContainer() {
    return (
      <ThemedView
        style={[
          styles.fullWidthContainer,
          styles.iconTextContainer,
          { backgroundColor: cardColor },
        ]}
      >
        <Feather
          name="eye"
          size={24}
          color={iconColor}
          style={styles.iconStyle}
        />
        <ThemedText type="defaultSemiBold" style={styles.itemText}>
          سمة القراءة:
        </ThemedText>
      </ThemedView>
    );
  }
  return (
    <ThemedView
      style={[
        styles.settingsSection,
        styles.columnSection,
        { backgroundColor: cardColor },
      ]}
    >
      {renderFullWidthContainer()}
      <Pressable style={styles.fullWidth} accessibilityRole="radiogroup">
        <SegmentedControl
          options={READING_THEME_LABELS}
          initialSelectedIndex={READING_THEME_KEYS.indexOf(readingThemeValue)}
          activeColor={primaryColor}
          textColor={primaryColor}
          onSelectionChange={(index: number) => {
            setReadingThemeValue(READING_THEME_KEYS[index]);
          }}
        />
      </Pressable>
    </ThemedView>
  );
}
