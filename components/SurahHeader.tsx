/**
 * Inline header for the mushaf page renderer. Shows the surah name
 * pulled from the narration cache. Falls back to "Surah {number}"
 * when the qurani.ai narration omits the Arabic name (rare — most
 * editions include it).
 */

import { StyleSheet } from 'react-native';

import { useRiwayaCache } from '@/hooks/useRiwayaCache';

import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

type Props = {
  number: number;
};

export function SurahHeader({ number }: Props) {
  const { surahList } = useRiwayaCache();
  const meta = surahList.find((s: { number: number }) => s.number === number);
  const name = meta?.name?.trim() || `Surah ${number}`;
  const english = meta?.englishName?.trim();

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>
        {name}
      </ThemedText>
      {english ? (
        <ThemedText style={styles.english}>{english}</ThemedText>
      ) : null}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    gap: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
  },
  english: {
    fontSize: 13,
    opacity: 0.7,
    textAlign: 'center',
  },
});
