import React from 'react';
import { StyleSheet, Text } from 'react-native';

import { router } from 'expo-router';

import { ThemedButton } from '@/components/ThemedButton';
import { ThemedSafeAreaView } from '@/components/ThemedSafeAreaView';

export default function MoreScreen() {
  return (
    <ThemedSafeAreaView style={styles.container}>
      <ThemedButton onPress={() => router.push('/settings')} variant="primary">
        <Text>الإعدادات</Text>
      </ThemedButton>
      <ThemedButton onPress={() => router.push('/privacy')} variant="primary">
        <Text>سياسة الخصوصية</Text>
      </ThemedButton>
      <ThemedButton onPress={() => router.push('/contact')} variant="primary">
        <Text>تواصل معنا</Text>
      </ThemedButton>
      <ThemedButton onPress={() => router.push('/about')} variant="primary">
        <Text>حول التطبيق</Text>
      </ThemedButton>
    </ThemedSafeAreaView>
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
});
