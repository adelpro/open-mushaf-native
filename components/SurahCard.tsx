import React from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { useRouter } from 'expo-router';

import { useColors } from '@/hooks/useColors';
import { Surah } from '@/types';

import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

type Props = {
  surah: Surah;
};

export default function SurahCard({ surah }: Props) {
  const router = useRouter();

  const { backgroundColor, textColor } = useColors();

  const handlePress = () => {
    router.replace({
      pathname: '/',
      params: { page: surah.startingPage, temporary: 'true' },
    });
  };

  return (
    <Pressable
      onPress={handlePress}
      style={[styles.container, { backgroundColor }]}
    >
      <ThemedView style={styles.content}>
        <ThemedText style={[styles.number, { color: textColor }]}>
          {surah.number}
        </ThemedText>
        <ThemedText style={[styles.name, { color: textColor }]}>
          {surah.name}
        </ThemedText>
      </ThemedView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    maxWidth: 640,
    borderWidth: 1,
    borderRadius: 5,
    padding: 1,
    borderColor: '#e0e0e0',
    elevation: 3,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  content: {
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'row',
    height: 80,
    width: '100%',
  },
  number: {
    fontSize: 20,
    fontFamily: 'Tajawal_700Bold',
    fontStyle: 'italic',
    padding: 10,
    textAlign: 'center',
    minWidth: 40,
    marginHorizontal: 10,
  },
  name: {
    fontSize: 20,
    fontFamily: 'Amiri_400Regular',
    lineHeight: 24,
    padding: 10,
  },
});
