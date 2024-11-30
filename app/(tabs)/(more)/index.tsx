import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

import { router } from 'expo-router';

import { ThemedButton } from '@/components/ThemedButton';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useColors } from '@/hooks/useColors';

export default function MoreScreen() {
  const { primaryColor } = useColors();
  return (
    <ThemedView style={styles.container}>
      <ThemedButton
        onPress={() => router.push('/settings')}
        style={[styles.button]}
        variant="primary"
      >
        <Text style={styles.buttonText}>الإعدادات</Text>
      </ThemedButton>
      <ThemedButton
        onPress={() => router.push('/privacy')}
        style={[styles.button]}
        variant="primary"
      >
        <Text style={styles.buttonText}>سياسة الخصوصية</Text>
      </ThemedButton>
      <ThemedButton
        onPress={() => router.push('/contact')}
        style={[styles.button]}
        variant="primary"
      >
        <Text style={styles.buttonText}>تواصل معنا</Text>
      </ThemedButton>
      <ThemedButton
        onPress={() => router.push('/about')}
        style={[styles.button]}
        variant="primary"
      >
        <Text style={styles.buttonText}>حول التطبيق</Text>
      </ThemedButton>
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
    //color: '#FFFFFF',
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
    paddingVertical: 10,
  },
});
