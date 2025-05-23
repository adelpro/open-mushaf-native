import React from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { useRouter } from 'expo-router';

import { useColors } from '@/hooks/useColors';
import { Surah } from '@/types';

import { IslamicMark } from './IslamicMarker';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

type Props = {
  surah: Surah;
};

export default function SurahCard({ surah }: Props) {
  const router = useRouter();

  const { backgroundColor, textColor, primaryColor, secondaryColor } =
    useColors();

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
        <ThemedView style={styles.numberContainer}>
          <IslamicMark
            width={50}
            height={50}
            strokeWidth={24}
            fill={primaryColor}
            stroke={secondaryColor}
          />
          <ThemedText style={[styles.number, { color: secondaryColor }]}>
            {surah.number}
          </ThemedText>
        </ThemedView>
      </ThemedView>

      <ThemedView style={styles.surahContainer}>
        <ThemedText style={[styles.name, { color: textColor }]}>
          {surah.name}
        </ThemedText>
        <ThemedView style={styles.infoWrapper}>
          <ThemedText style={[styles.infoText, { color: textColor }]}>
            {surah.revelationType === 'Meccan' ? 'مكية' : 'مدنية'}
          </ThemedText>
          <ThemedText style={[styles.infoText, { color: textColor }]}>
            {` - `}
          </ThemedText>
          <ThemedText style={[styles.infoText, { color: textColor }]}>
            {`آياتها: ${surah.numberOfAyahs}`}
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
  number: {
    fontSize: 16,
    fontFamily: 'Tajawal_400Regular',
    padding: 2,
    textAlign: 'center',
    textAlignVertical: 'center',
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: '-50%' }, { translateY: '-50%' }],
    alignItems: 'baseline',
  },
  content: {
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'row',
    height: 80,
    width: '100%',
  },
  numberContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 10,
  },

  name: {
    fontSize: 22,
    fontFamily: 'Amiri_400Regular',
    lineHeight: 26,
    padding: 10,
  },
  surahContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flex: 1,
  },
  infoWrapper: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: 15,
    marginHorizontal: 20,
  },
  infoText: {
    fontSize: 16,
    fontFamily: 'Tajawal_400Regular',

    marginHorizontal: 2,
  },
});
