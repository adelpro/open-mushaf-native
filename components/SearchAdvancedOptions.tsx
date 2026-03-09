import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

/**
 * Search options representing active toggle states for advanced linguistic parsing.
 */
interface AdvancedOptions {
  /** If true, expands search scope matching lemma forms. */
  lemma: boolean;
  /** If true, expands search scope matching root structures. */
  root: boolean;
  /** If true, permits typographical fuzzy matching. */
  fuzzy: boolean;
}

/**
 * Props for the SearchAdvancedOptions context component.
 */
interface SearchAdvancedOptionsProps {
  /** Payload of the active search settings. */
  advancedOptions: AdvancedOptions;
  /** Modifier callback emitted on press toggle. */
  toggleOption: (option: keyof AdvancedOptions) => void;
}

/**
 * Renders a row of toggleable chips ('Lemma', 'Root', 'Fuzzy') affecting the search query expansion logic.
 *
 * @param props - Defines the control state mapped from the parent container.
 * @returns An interactive view displaying the available filter controls.
 */
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
