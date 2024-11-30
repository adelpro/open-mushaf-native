import React from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { router } from 'expo-router';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useColors } from '@/hooks/useColors';

export default function MoreScreen() {
  const { primaryColor } = useColors();
  return (
    <ThemedView style={styles.container}>
      <Pressable
        onPress={() => router.push('/settings')}
        style={[styles.button, { backgroundColor: primaryColor }]}
      >
        <ThemedText type="title" style={styles.buttonText}>
          الإعدادات
        </ThemedText>
      </Pressable>
      <Pressable
        onPress={() => router.push('/privacy')}
        style={[styles.button, { backgroundColor: primaryColor }]}
      >
        <ThemedText type="title" style={styles.buttonText}>
          سياسة الخصوصية
        </ThemedText>
      </Pressable>
      <Pressable
        onPress={() => router.push('/contact')}
        style={[styles.button, { backgroundColor: primaryColor }]}
      >
        <ThemedText type="title" style={styles.buttonText}>
          تواصل معنا
        </ThemedText>
      </Pressable>
      <Pressable
        onPress={() => router.push('/about')}
        style={[styles.button, { backgroundColor: primaryColor }]}
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
    boxShadow: '0px 5px 5px rgba(0, 0, 0, 0.2)',
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
