import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

import { useRouter } from 'expo-router';

import { ThemedView } from '@/components/ThemedView';

export default function PrivacyScreen() {
  const router = useRouter();

  return (
    <ThemedView style={styles.container}>
      <Pressable onPress={() => router.back()} style={styles.backButton}>
        <Text style={styles.link}>رجوع</Text> {/* Back button text in Arabic */}
      </Pressable>
      <Text style={styles.title}>سياسة الخصوصية</Text>
      <Text style={styles.content}>محتوى سياسة الخصوصية ...</Text>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'flex-start',
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
