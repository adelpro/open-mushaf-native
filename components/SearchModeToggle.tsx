/**
 * Segmented control for switching between keyword and AI search modes inside
 * the existing /search screen. Renders below the SearchInput.
 *
 * Hidden entirely when the user disables AI search in Settings (aiSearchHidden
 * atom). When visible, the user picks per-query which path to use; the choice
 * is persisted in the `searchMode` atom so it survives navigation.
 */

import React from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { useAtom, useAtomValue } from 'jotai/react';

import { aiSearchHidden, searchMode as searchModeAtom } from '@/jotai/atoms';

import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

export type SearchModeToggleProps = {
  /** Theme accent color for the active tab. */
  tintColor: string;
};

type Mode = 'keyword' | 'ai';

const TABS: {
  key: Mode;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  { key: 'keyword', label: 'كلمات مفتاحية', icon: 'search-outline' },
  { key: 'ai', label: 'بالذكاء الاصطناعي', icon: 'sparkles-outline' },
];

export function SearchModeToggle({ tintColor }: SearchModeToggleProps) {
  const hidden = useAtomValue(aiSearchHidden);
  const [mode, setMode] = useAtom(searchModeAtom);

  if (hidden) return null;

  return (
    <ThemedView style={styles.container}>
      {TABS.map((tab) => {
        const active = mode === tab.key;
        return (
          <Pressable
            key={tab.key}
            onPress={() => setMode(tab.key)}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            accessibilityLabel={tab.label}
            style={[
              styles.tab,
              active && {
                backgroundColor: tintColor,
                borderColor: tintColor,
              },
              !active && styles.tabInactive,
            ]}
          >
            <Ionicons
              name={tab.icon}
              size={16}
              color={active ? '#fff' : '#666'}
              style={styles.icon}
            />
            <ThemedText
              style={[
                styles.label,
                active ? styles.labelActive : styles.labelInactive,
              ]}
            >
              {tab.label}
            </ThemedText>
          </Pressable>
        );
      })}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#F2F2F2',
    borderRadius: 10,
    padding: 4,
    marginBottom: 10,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  tabInactive: {
    backgroundColor: 'transparent',
  },
  icon: { marginHorizontal: 4 },
  label: {
    fontSize: 13,
    fontWeight: '600',
  },
  labelActive: { color: '#fff' },
  labelInactive: { color: '#555' },
});
