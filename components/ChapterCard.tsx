import React from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { useRouter } from 'expo-router';

import IslamicMarkSVG from '@/assets/svgs/islamic-mark.svg';
import { useColors } from '@/hooks/useColors';
import { Chapter } from '@/types';

import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

type Props = {
  chapter: Chapter;
};

export default function ChapterCard({ chapter }: Props) {
  const router = useRouter();
  const { backgroundColor, textColor, secondaryColor } = useColors();

  const handlePress = () => {
    router.replace({
      pathname: '/',
      params: { page: chapter.startingPage, temporary: 'true' },
    });
  };

  return (
    <Pressable
      onPress={handlePress}
      style={[styles.container, { backgroundColor }]}
    >
      <ThemedView style={styles.content}>
        <ThemedView style={styles.numberContainer}>
          <IslamicMarkSVG width={50} height={50} />
          <ThemedText style={[styles.number, { color: secondaryColor }]}>
            {chapter.number}
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.chapterContainer}>
          <ThemedText style={[styles.name, { color: textColor }]}>
            {chapter.name}
          </ThemedText>
        </ThemedView>
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
    justifyContent: 'center',
    alignItems: 'center',
  },

  content: {
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'row',
    height: 80,
    width: '100%',
  },
  numberContainer: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
    position: 'relative',
  },
  number: {
    fontSize: 16,
    fontFamily: 'Tajawal_400Regular',
    textAlign: 'center',
    textAlignVertical: 'center',
    includeFontPadding: false,
    position: 'absolute',
    top: 25, // Half of container height (50/2)
    left: 25, // Half of container width (50/2)
    transform: [{ translateX: -8 }, { translateY: -8 }], // Adjust based on font size
    width: 16,
    height: 16,
    lineHeight: 16, // Match font size for better vertical centering
  },

  name: {
    fontSize: 22,
    fontFamily: 'Amiri_400Regular',
    lineHeight: 26,
    padding: 10,
  },
  chapterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flex: 1,
  },
});
