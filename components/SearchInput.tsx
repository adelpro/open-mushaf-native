import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet } from 'react-native';

import { Feather, Ionicons } from '@expo/vector-icons';

import { ThemedTextInput } from './ThemedTextInput';
import { ThemedView } from './ThemedView';

interface SearchInputProps {
  value: string;
  onChangeText: (text: string) => void;
  isTyping: boolean;
  isSearching: boolean;
  showOptions: boolean;
  setShowOptions: (show: boolean) => void;
  primaryColor: string;
  secondaryColor: string;
}

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
