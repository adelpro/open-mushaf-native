import React from 'react';
import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function PrivacyScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>سياسة الخصوصية</ThemedText>
      <ThemedText style={styles.content}>محتوى سياسة الخصوصية ...</ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButton: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  content: {
    fontSize: 16,
    lineHeight: 22,
    marginTop: 10,
  },
  link: {
    color: '#007AFF',
  },
});
