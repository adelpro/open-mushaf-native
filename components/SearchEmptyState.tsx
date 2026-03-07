import React from 'react';
import { StyleSheet } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

interface SearchEmptyStateProps {
  type: 'initial' | 'no-results';
  primaryColor: string;
  dangerColor: string;
}

export function SearchEmptyState({
  type,
  primaryColor,
  dangerColor,
}: SearchEmptyStateProps) {
  const isInitial = type === 'initial';

  return (
    <ThemedView style={styles.emptyContainer}>
      <ThemedView
        style={[
          styles.emptyIconWrapper,
          { backgroundColor: isInitial ? primaryColor : dangerColor },
        ]}
      >
        <Ionicons
          name={isInitial ? 'book-outline' : 'alert-circle-outline'}
          size={40}
          color="#fff"
        />
      </ThemedView>
      <ThemedText type="defaultSemiBold" style={styles.emptyTitle}>
        {isInitial ? 'ابحث في القرآن الكريم' : 'لم يتم العثور على نتائج'}
      </ThemedText>
      <ThemedText style={styles.emptySubtitle}>
        {isInitial
          ? 'أدخل كلمة عربية للبحث عنها في آيات القرآن الكريم.'
          : 'تأكد من كتابة الكلمة بشكل صحيح، أو جرّب كلمة أخرى.'}
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginTop: 64,
  },
  emptyIconWrapper: {
    width: 84,
    height: 84,
    borderRadius: 42,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    marginBottom: 6,
    textAlign: 'center',
  },
  emptySubtitle: {
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 22,
    opacity: 0.8,
  },
});
