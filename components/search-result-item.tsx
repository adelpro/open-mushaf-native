import React from 'react';
import { Pressable, StyleSheet, TouchableOpacity, View } from 'react-native';

import { router } from 'expo-router';

import { HighlightText } from '@/components/highlight-arabic';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { QuranText, WordMap } from '@/types';

interface SearchResultItemProps {
  item: QuranText;
  query: string;
  advancedOptions: { lemma: boolean; root: boolean };
  wordMap: WordMap;
  getPositiveTokens: (
    verse: QuranText,
    mode: 'text' | 'lemma' | 'root',
    targetLemma?: string,
    targetRoot?: string,
    cleanQuery?: string,
  ) => string[];
  onSelectAya: (aya: { aya: number; surah: number }) => void;
}

export default function SearchResultItem({
  item,
  query,
  advancedOptions,
  wordMap,
  getPositiveTokens,
  onSelectAya,
}: SearchResultItemProps) {
  const cleanQuery = query.trim();
  const mapEntry = wordMap[cleanQuery];

  // Collect tokens for highlighting
  const directTokens: string[] = [];
  const relatedTokens: string[] = [];
  const fuzzyTokens: string[] = [];

  if (getPositiveTokens) {
    const textMatches = getPositiveTokens(
      item,
      'text',
      undefined,
      undefined,
      query,
    );
    directTokens.push(...textMatches);

    if (advancedOptions.lemma && mapEntry?.lemma) {
      const lemmaMatches = getPositiveTokens(
        item,
        'lemma',
        mapEntry.lemma,
        undefined,
        query,
      );
      relatedTokens.push(
        ...lemmaMatches.filter((w) => !textMatches.includes(w)),
      );
    }

    if (advancedOptions.root && mapEntry?.root) {
      const rootMatches = getPositiveTokens(
        item,
        'root',
        undefined,
        mapEntry.root,
        query,
      );
      relatedTokens.push(
        ...rootMatches.filter(
          (w) => !textMatches.includes(w) && !relatedTokens.includes(w),
        ),
      );
    }
  }

  return (
    <TouchableOpacity
      onPress={() => onSelectAya({ aya: item.aya_id, surah: item.sura_id })}
    >
      <ThemedView style={styles.item}>
        <View style={styles.header}>
          <Pressable
            onPress={() =>
              router.replace({
                pathname: '/',
                params: { page: item.page_id.toString(), temporary: 'true' },
              })
            }
          >
            <ThemedText type="link">{`سورة: ${item.sura_name} - الآية: ${item.aya_id}`}</ThemedText>
          </Pressable>
        </View>

        <ThemedText type="default" style={styles.uthmani}>
          <HighlightText
            text={item.standard}
            tokens={directTokens}
            relatedWords={relatedTokens}
            fuzzyWords={fuzzyTokens}
            color="#FFEB3B"
            style={{ fontSize: 18 }}
          />
        </ThemedText>
      </ThemedView>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  item: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'center',
    gap: 5,
    padding: 15,
    marginHorizontal: 10,
    borderBottomWidth: 1,
  },
  uthmani: { paddingVertical: 10, fontFamily: 'Amiri_400Regular' },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    width: '100%',
  },
});
