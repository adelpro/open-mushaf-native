import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';

import { router } from 'expo-router';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

const MoreScreen = () => {
  return (
    <ThemedView style={styles.container}>
      <TouchableOpacity
        onPress={() => router.push('/about')}
        style={styles.linkContainer}
        activeOpacity={0.7}
      >
        <ThemedText style={styles.link}>حول التطبيق</ThemedText>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => router.push('/privacy')}
        style={styles.linkContainer}
        activeOpacity={0.7}
      >
        <ThemedText style={styles.link}>سياسة الخصوصية</ThemedText>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => router.push('/settings')}
        style={styles.linkContainer}
        activeOpacity={0.7}
      >
        <ThemedText style={styles.link}>الإعدادات</ThemedText>
      </TouchableOpacity>
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
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    elevation: 2, // For subtle shadow
    alignItems: 'center',
  },
  link: {
    fontSize: 22,
    color: '#1E90FF',
    textAlign: 'center',
    fontWeight: '500',
    letterSpacing: 0.5,
  },
});

export default MoreScreen;
