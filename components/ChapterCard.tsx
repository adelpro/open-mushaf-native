import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';

import { Image } from 'expo-image';
import { useRouter } from 'expo-router';

import { Chapter } from '@/types/chapter';

import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

type Props = {
  chapter: Chapter;
};

export default function ChapterCard({ chapter }: Props) {
  const router = useRouter();

  const handlePress = () => {
    router.replace({
      pathname: '/',
      params: { page: chapter.startingPage },
    });
  };

  return (
    <TouchableOpacity onPress={handlePress} style={styles.container}>
      <ThemedView style={styles.content}>
        <ThemedText style={styles.number}>{chapter.number}</ThemedText>
        <ThemedView>
          <ThemedView>
            <ThemedText style={styles.name}>{chapter.name}</ThemedText>
          </ThemedView>
          <ThemedText style={styles.englishName}>
            {chapter.englishName}
          </ThemedText>
        </ThemedView>
      </ThemedView>
      <ThemedView style={styles.imageContianer}>
        <Image
          source={require('../assets/images/background-list-left.png')}
          style={styles.image}
        />
      </ThemedView>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#000000',
    borderRadius: 2,
    marginHorizontal: 8,
    marginVertical: 4,
    padding: 1,
    display: 'flex',
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
    fontWeight: 'bold',
    fontSize: 24,
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
    resizeMode: 'contain',
  },
});
