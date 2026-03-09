import React from 'react';
import { Pressable, StyleSheet, TouchableOpacity, View } from 'react-native';

import { router } from 'expo-router';
import { type QuranText, type WordMap } from 'quran-search-engine';

import { HighlightText } from '@/components/HighlightArabic';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useColors } from '@/hooks';

/**
 * Structural payload definition configuring search list mapping output.
 */
type SearchResultItemProps = {
  /** A matched document dictionary record containing context strings and IDs. */
  item: QuranText;
  /** The original unmodified search term inputted by the user. */
  query: string;
  /** Toggle options altering token matching leniency. */
  advancedOptions: { lemma: boolean; root: boolean; fuzzy: boolean };
  /** A dictionary containing morphological breakdown associations. */
  wordMap: WordMap;
  /** Helper tool function emitting an array of explicitly highlighted matches. */
  getPositiveTokens: (
    verse: QuranText,
    mode: 'text' | 'lemma' | 'root' | 'fuzzy',
    targetLemma?: string,
    targetRoot?: string,
    cleanQuery?: string,
  ) => string[];
  /** Handler fired traversing back to a mapped location within the `MushafPage`. */
  onSelectAya: (aya: { aya: number; surah: number }) => void;
  disabled?: boolean;
};

/**
 * A render block component used within lists displaying individual search query hits.
 * Integrates directly with `HighlightText` to logically process string offsets
 * and render appropriate color backgrounds on matching tokens.
 *
 * @param props - Mapped document record with filtering states.
 * @returns A touchable card yielding `<HighlightText />` fragments.
 */
export function SearchResultItem({
  item,
  query,
  advancedOptions,
  wordMap,
  getPositiveTokens,
  onSelectAya,
  disabled,
}: SearchResultItemProps) {
  const { directColor, fuzzyColor, relatedColor } = useColors();
  const cleanQuery = query.trim();
  const mapEntry = wordMap[cleanQuery];

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

    if (advancedOptions.fuzzy) {
      const fuzzyMatches = getPositiveTokens(
        item,
        'fuzzy',
        undefined,
        undefined,
        query,
      );
      fuzzyTokens.push(
        ...fuzzyMatches.filter(
          (w) =>
            !textMatches.includes(w) &&
            !relatedTokens.includes(w) &&
            !fuzzyTokens.includes(w),
        ),
      );
    }
  }

  return (
    <TouchableOpacity
      onPress={() => onSelectAya({ aya: item.aya_id, surah: item.sura_id })}
      accessibilityLabel={`سورة ${item.sura_name} الآية ${item.aya_id}`}
      accessibilityHint="اضغط لعرض التفسير"
      accessibilityRole="button"
      disabled={disabled}
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
            color={directColor} // main tokens
            relatedColor={relatedColor} // if HighlightText supports it
            fuzzyColor={fuzzyColor} // fuzzy matches
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
