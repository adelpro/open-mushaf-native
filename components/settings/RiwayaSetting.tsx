import { Pressable } from 'react-native';

import { Feather } from '@expo/vector-icons';
import { useAtom } from 'jotai/react';

import { SegmentedControl, ThemedText, ThemedView } from '@/components';
import { riwayaOptions } from '@/constants';
import { useColors } from '@/hooks';
import { mushafRiwaya } from '@/jotai/atoms';
import { styles } from '@/styles/screens/settings.styles';
import { RiwayaByIndice, RiwayaByValue } from '@/utils';
export function RiwayaSetting() {
  const { primaryColor, cardColor, iconColor } = useColors();
  const [mushafRiwayaValue, setMushafRiwayaValue] = useAtom(mushafRiwaya);

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
          name="book-open"
          size={24}
          color={iconColor}
          style={styles.iconStyle}
        />
        <ThemedText type="defaultSemiBold" style={styles.itemText}>
          إختيار الرواية :
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
          options={riwayaOptions}
          initialSelectedIndex={RiwayaByIndice(mushafRiwayaValue)}
          activeColor={primaryColor}
          textColor={primaryColor}
          onSelectionChange={(index: number) => {
            const selectedRiwaya = RiwayaByValue(index);
            setMushafRiwayaValue(selectedRiwaya);
          }}
        />
      </Pressable>
    </ThemedView>
  );
}
