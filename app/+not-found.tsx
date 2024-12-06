import { StyleSheet } from 'react-native';

import { Link, Stack } from 'expo-router';

import { ThemedSafeAreaView } from '@/components/ThemedSafeAreaView';
import { ThemedText } from '@/components/ThemedText';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <ThemedSafeAreaView style={styles.container}>
        <ThemedText type="title">.صفحة غير موجودة</ThemedText>
        <Link href="/" style={styles.link}>
          <ThemedText type="link">العودة إلى الصفحة الرئيسية</ThemedText>
        </Link>
      </ThemedSafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
});
