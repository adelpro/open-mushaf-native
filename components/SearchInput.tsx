import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet } from 'react-native';

import { Feather, Ionicons } from '@expo/vector-icons';
import { useAtom, useAtomValue } from 'jotai/react';

import { aiSearchHidden, searchMode } from '@/jotai/atoms';

import { ThemedTextInput } from './ThemedTextInput';
import { ThemedView } from './ThemedView';

/**
 * Props for the generalized SearchInput component.
 */
interface SearchInputProps {
  /** Controlled value. */
  value: string;
  /** Callback triggered on input change. */
  onChangeText: (text: string) => void;
  /** Sets progress spinner for debouncing delays. */
  isTyping: boolean;
  /** Sets progress spinner for active async API search fetching. */
  isSearching: boolean;
  /** Current state tracker for the search filter toggles. */
  showOptions: boolean;
  /** State modifier handler. */
  setShowOptions: (show: boolean) => void;
  primaryColor: string;
  secondaryColor: string;
}

/**
 * A combined search input text field bundling a loading indicator, the
 * keyword ↔ AI mode switch, and an options toggle — tailored for Arabic
 * linguistic datasets.
 *
 * @param props - Component dependencies and hooks passing.
 * @returns A cohesive `<TextInput>` based input bar element.
 */
export function SearchInput({
  value,
  onChangeText,
  isTyping,
  isSearching,
  showOptions,
  setShowOptions,
  primaryColor,
  secondaryColor,
}: SearchInputProps) {
  const hidden = useAtomValue(aiSearchHidden);
  const [mode, setMode] = useAtom(searchMode);
  const aiActive = mode === 'ai';

  return (
    <ThemedView style={styles.searchContainer}>
      <ThemedTextInput
        variant="outlined"
        style={styles.searchInput}
        placeholder="البحث..."
        value={value}
        cursorColor={secondaryColor}
        onChangeText={onChangeText}
      />
      {isTyping || isSearching ? (
        <ActivityIndicator
          size="small"
          color={primaryColor}
          style={styles.icon}
        />
      ) : (
        <Feather
          name="search"
          size={20}
          color={primaryColor}
          style={styles.icon}
        />
      )}
      {!hidden ? (
        <Pressable
          onPress={() => setMode(aiActive ? 'keyword' : 'ai')}
          accessibilityRole="button"
          accessibilityLabel={
            aiActive ? 'التبديل إلى البحث النصي' : 'التبديل إلى البحث الذكي'
          }
          accessibilityState={{ selected: aiActive }}
          hitSlop={4}
        >
          <Ionicons
            name={aiActive ? 'sparkles' : 'sparkles-outline'}
            size={20}
            color={aiActive ? primaryColor : '#777'}
            style={styles.icon}
          />
        </Pressable>
      ) : null}
      <Pressable
        onPress={() => setShowOptions(!showOptions)}
        accessibilityRole="button"
        accessibilityLabel="خيارات البحث المتقدم"
        accessibilityState={{ expanded: showOptions }}
      >
        <Ionicons
          name="options"
          size={20}
          color={showOptions ? primaryColor : '#777'}
          style={styles.icon}
        />
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 10,
    paddingHorizontal: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    textAlign: 'right',
    paddingVertical: 10,
    borderWidth: 0,
  },
  icon: { marginHorizontal: 6 },
});
