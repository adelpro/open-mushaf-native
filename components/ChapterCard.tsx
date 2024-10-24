import React from 'react';
import { Pressable, StyleSheet, useColorScheme } from 'react-native';

import { Image } from 'expo-image';
import { useRouter } from 'expo-router';

import { Colors } from '@/constants/Colors';
import { Chapter } from '@/types';

import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

type Props = {
  chapter: Chapter;
};

export default function ChapterCard({ chapter }: Props) {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const backgroundColor = Colors[colorScheme ?? 'light'].background;

  const handlePress = () => {
    router.replace({
      pathname: '/',
      params: { page: chapter.startingPage },
    });
  };

  return (
    <Pressable
      onPress={handlePress}
      style={[styles.container, { backgroundColor }]}
    >
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
          contentFit="fill"
        />
      </ThemedView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 110,
    borderWidth: 1,
    borderRadius: 5,
    padding: 1,
    borderColor: '#e0e0e0',
    backgroundColor: '#ffffff',
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
    color: '#808080',
    fontStyle: 'italic',
    padding: 5,
    textAlign: 'center',
    minWidth: 40,
    marginLeft: 10,
  },
  name: {
    fontSize: 24,
    lineHeight: 24,
    padding: 10,
  },
  englishName: {
    color: '#808080',
    fontSize: 18,
    fontStyle: 'italic',
    lineHeight: 12,
    marginTop: 5,
    padding: 5,
  },
  imageContianer: {
    width: '30%',
    maxWidth: 100,
    height: '100%',
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 5,
    padding: 1,
    //resizeMode: 'stretch',
  },
});
