import React from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { Image } from 'expo-image';
import { useRouter } from 'expo-router';

import { Surah } from '@/types';

import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

type Props = {
  surah: Surah;
};

export default function SurahCard({ surah }: Props) {
  const router = useRouter();

  const handlePress = () => {
    router.replace({
      pathname: '/',
      params: { page: surah.startingPage },
    });
  };

  return (
    <Pressable onPress={handlePress} style={styles.container}>
      <ThemedView style={styles.content}>
        <ThemedText style={styles.number}>{surah.number}</ThemedText>
        <ThemedView>
          <ThemedView>
            <ThemedText style={styles.name}>{surah.name}</ThemedText>
          </ThemedView>
          <ThemedText style={styles.englishName}>
            {surah.englishName}
          </ThemedText>
        </ThemedView>
      </ThemedView>
      <ThemedView style={styles.imageContianer}>
        <Image
          source={require('../assets/images/background-list-left.png')}
          style={styles.image}
          contentFit="fill"
        />
      </ThemedView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 5,
    padding: 1,
    marginHorizontal: 16,
    marginVertical: 8,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  content: {
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'row',
    height: 100,
  },
  number: {
    fontWeight: '600',
    fontSize: 22,
    color: '#333',
    paddingHorizontal: 8,
    textAlign: 'center',
    minWidth: 40,
    marginLeft: 10,
  },
  name: {
    fontSize: 24,
    lineHeight: 24,
  },
  englishName: {
    color: '#808080',
    fontSize: 18,
    fontStyle: 'italic',
    lineHeight: 12,
    marginTop: 5,
  },
  imageContianer: {
    width: '30%',
    height: '100%',
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 5,
    padding: 1,
  },
});
