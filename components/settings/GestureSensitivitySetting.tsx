import { Feather } from '@expo/vector-icons';
import { useAtom } from 'jotai/react';

import { AwesomeSlider, ThemedText, ThemedView } from '@/components';
import { useColors } from '@/hooks';
import { panGestureSensitivity } from '@/jotai/atoms';
import { styles } from '@/styles/screens/settings.styles';
export function GestureSensitivitySetting() {
  const { primaryColor, cardColor, iconColor } = useColors();
  const [panGestureSensitivityValue, setPanGestureSensitivityValue] = useAtom(
    panGestureSensitivity,
  );

  function renderRowContainer() {
    return (
      <ThemedView
        style={[
          styles.rowContainer,
          styles.iconTextContainer,
          { backgroundColor: cardColor },
        ]}
      >
        <Feather
          name="sliders"
          size={24}
          color={iconColor}
          style={styles.iconStyle}
        />
        <ThemedText type="defaultSemiBold" style={styles.itemText}>
          {` حساسية السحب: (${Number(panGestureSensitivityValue).toFixed(1)}x)`}
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
          value={panGestureSensitivityValue}
          minimumValue={0.5}
          maximumValue={2.0}
          onValueChange={setPanGestureSensitivityValue}
          primaryColor={primaryColor}
        />
      </ThemedView>
    </ThemedView>
  );
}
