import { Entypo } from '@expo/vector-icons';
import { useAtom } from 'jotai/react';

import { AwesomeSlider, ThemedText, ThemedView } from '@/components';
import { useColors } from '@/hooks';
import { mushafContrast } from '@/jotai/atoms';
import { styles } from '@/styles/screens/settings.styles';
export function MushafContrastSetting() {
  const { primaryColor, cardColor, iconColor } = useColors();
  const [mushafContrastValue, setMushafContrastValue] = useAtom(mushafContrast);

  function renderRowContainer() {
    return (
      <ThemedView
        style={[
          styles.rowContainer,
          styles.iconTextContainer,
          { backgroundColor: cardColor },
        ]}
      >
        <Entypo
          name="light-up"
          size={24}
          color={iconColor}
          style={styles.iconStyle}
        />
        <ThemedText type="defaultSemiBold" style={styles.itemText}>
          {` سطوع الوضع الليلي: (${Number(mushafContrastValue * 100).toFixed(0)}%)`}
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
      {renderRowContainer()}

      <ThemedView
        style={[styles.sliderContainer, { backgroundColor: cardColor }]}
      >
        <AwesomeSlider
          value={mushafContrastValue}
          onValueChange={setMushafContrastValue}
          primaryColor={primaryColor}
        />
      </ThemedView>
    </ThemedView>
  );
}
