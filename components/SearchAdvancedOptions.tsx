import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

interface AdvancedOptions {
  lemma: boolean;
  root: boolean;
  fuzzy: boolean;
}

interface SearchAdvancedOptionsProps {
  advancedOptions: AdvancedOptions;
  toggleOption: (option: keyof AdvancedOptions) => void;
}

export function SearchAdvancedOptions({
  advancedOptions,
  toggleOption,
}: SearchAdvancedOptionsProps) {
  return (
    <ThemedView style={styles.advancedOptions}>
      <View style={styles.optionRow}>
        <Pressable
          style={[
            styles.optionButton,
            advancedOptions.lemma && styles.optionActive,
          ]}
          onPress={() => toggleOption('lemma')}
          accessibilityRole="togglebutton"
          accessibilityState={{ checked: advancedOptions.lemma }}
        >
          <ThemedText
            style={advancedOptions.lemma ? styles.optionActiveText : undefined}
          >
            الصيغة
          </ThemedText>
        </Pressable>

        <Pressable
          style={[
            styles.optionButton,
            advancedOptions.root && styles.optionActive,
          ]}
          onPress={() => toggleOption('root')}
          accessibilityRole="togglebutton"
          accessibilityState={{ checked: advancedOptions.root }}
        >
          <ThemedText
            style={advancedOptions.root ? styles.optionActiveText : undefined}
          >
            الجذر
          </ThemedText>
        </Pressable>
        <Pressable
          style={[
            styles.optionButton,
            advancedOptions.fuzzy && styles.optionActive,
          ]}
          onPress={() => toggleOption('fuzzy')}
          accessibilityRole="togglebutton"
          accessibilityState={{ checked: advancedOptions.fuzzy }}
        >
          <ThemedText
            style={advancedOptions.fuzzy ? styles.optionActiveText : undefined}
          >
            التقريب
          </ThemedText>
        </Pressable>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  advancedOptions: {
    padding: 10,
    marginBottom: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
  },
  optionRow: { flexDirection: 'row', justifyContent: 'center', gap: 10 },
  optionButton: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  optionActive: { backgroundColor: '#e3f2fd', borderColor: '#1976d2' },
  optionActiveText: { color: '#1976d2', fontWeight: '600' },
});
