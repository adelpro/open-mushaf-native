import React from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { router } from 'expo-router';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

const MoreScreen = () => {
  return (
    <ThemedView style={styles.container}>
      <Pressable
        onPress={() => router.push('/about')}
        style={styles.linkContainer}
      >
        <ThemedText style={styles.link}>حول التطبيق</ThemedText>
      </Pressable>
      <Pressable
        onPress={() => router.push('/privacy')}
        style={styles.linkContainer}
      >
        <ThemedText style={styles.link}>سياسة الخصوصية</ThemedText>
      </Pressable>
      <Pressable
        onPress={() => router.push('/settings')}
        style={styles.linkContainer}
      >
        <ThemedText style={styles.link}>الإعدادات</ThemedText>
      </Pressable>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  linkContainer: {
    marginVertical: 12,
    width: '100%',
    paddingVertical: 15,

    borderRadius: 10,
    elevation: 2, // For subtle shadow
    alignItems: 'center',
  },
  link: {
    fontSize: 22,
    paddingVertical: 10,
    color: '#1E90FF',
    textAlign: 'center',
    fontWeight: '500',
    letterSpacing: 0.5,
  },
});

export default MoreScreen;
