/**
 * Single-ayah row used inside `MushafPageText`. Shows the verse
 * text (Uthmani), the per-narration ayah number badge, and an
 * optional sajda marker. Tapping the row selects the ayah — the
 * parent `MushafPageText` opens `TafseerPopup` in response.
 */

import { Pressable, StyleSheet, View } from 'react-native';

import type { QuranApiText } from '@/types/quran-api';

import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

type Props = {
  ayah: QuranApiText;
  onPress: () => void;
  selected: boolean;
};

export function AyahRow({ ayah, onPress, selected }: Props) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button">
      <ThemedView style={[styles.container, selected ? styles.selected : null]}>
        <View style={styles.row}>
          <View style={styles.numberBadge}>
            <ThemedText style={styles.numberText}>
              {ayah.numberInSurah}
            </ThemedText>
          </View>
          <ThemedText style={styles.text}>{ayah.text}</ThemedText>
        </View>
        {ayah.sajda ? (
          <ThemedText style={styles.sajda}>۩ سجدة</ThemedText>
        ) : null}
      </ThemedView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
  },
  selected: {
    backgroundColor: '#f5e6a3',
  },
  row: {
    flexDirection: 'row-reverse',
    alignItems: 'flex-start',
    gap: 10,
  },
  numberBadge: {
    minWidth: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ffffff22',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  numberText: {
    fontSize: 14,
    fontWeight: '600',
  },
  text: {
    flex: 1,
    fontSize: 22,
    lineHeight: 38,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  sajda: {
    fontSize: 12,
    opacity: 0.7,
    textAlign: 'center',
    marginTop: 4,
  },
});
