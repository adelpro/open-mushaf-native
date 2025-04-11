import { StyleSheet, Text, View } from 'react-native';

import { Stack } from 'expo-router';

import SEO from '@/components/seo';
import { ThemedSafeAreaView } from '@/components/ThemedSafeAreaView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useColors } from '@/hooks/useColors';

export default function TrackerScreen() {
  const { tintColor } = useColors();

  return (
    <>
      <Stack.Screen options={{ title: 'الورد' }} />
      <SEO
        title="الورد - المصحف المفتوح"
        description="تتبع وردك اليومي من القرآن الكريم"
      />
      <ThemedSafeAreaView style={styles.container}>
        <ThemedView style={styles.content}>
          <ThemedText style={styles.title}>الورد اليومي</ThemedText>
          <ThemedText style={styles.description}>
            قريباً - سيتم إضافة ميزة تتبع الورد اليومي في الإصدارات القادمة
          </ThemedText>
        </ThemedView>
      </ThemedSafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontFamily: 'Tajawal_700Bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  description: {
    fontSize: 18,
    fontFamily: 'Tajawal_400Regular',
    textAlign: 'center',
    marginBottom: 30,
  },
});
