import React from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { router } from 'expo-router';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useColors } from '@/hooks/useColors';

export default function MoreScreen() {
  const { tintColor } = useColors();
  return (
    <ThemedView style={styles.container}>
      <Pressable onPress={() => router.push('/settings')} style={styles.button}>
        <ThemedText type="title" style={styles.buttonText}>
          الإعدادات
        </ThemedText>
      </Pressable>
      <Pressable onPress={() => router.push('/privacy')} style={styles.button}>
        <ThemedText type="title" style={styles.buttonText}>
          سياسة الخصوصية
        </ThemedText>
      </Pressable>
      <Pressable
        onPress={() => router.push('/about')}
        style={[styles.button, { shadowColor: tintColor }]}
      >
        <ThemedText type="title" style={styles.buttonText}>
          حول التطبيق
        </ThemedText>
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    display: 'flex',
    gap: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    width: '90%',
    maxWidth: 640,
    borderRadius: 5,
    backgroundColor: '#4A90E2',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  buttonText: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
    paddingVertical: 10,
  },
});
