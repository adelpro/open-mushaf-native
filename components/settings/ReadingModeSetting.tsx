import { Pressable } from 'react-native';

import { Feather } from '@expo/vector-icons';
import { useAtom } from 'jotai/react';

import { SegmentedControl, ThemedText, ThemedView } from '@/components';
import { useColors } from '@/hooks';
import { readingMode } from '@/jotai/atoms';
import { styles } from '@/styles/screens/settings.styles';
import {
  getReadingModeByIndex,
  getReadingModeIndex,
} from '@/utils/readingMode';

export function ReadingModeSetting() {
  const { primaryColor, cardColor, iconColor } = useColors();
  const readingModeOptions = ['أفقي', 'عمودي'];
  const [readingModeValue, setReadingModeValue] = useAtom(readingMode);
  const handleReadingModeSelection = (index: number) =>
    setReadingModeValue(getReadingModeByIndex(index));

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
          name="columns"
          size={24}
          color={iconColor}
          style={styles.iconStyle}
        />
        <ThemedText type="defaultSemiBold" style={styles.itemText}>
          وضع القراءة:
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
          options={readingModeOptions}
          initialSelectedIndex={getReadingModeIndex(readingModeValue)}
          activeColor={primaryColor}
          textColor={primaryColor}
          onSelectionChange={handleReadingModeSelection}
        />
      </Pressable>
    </ThemedView>
  );
}
