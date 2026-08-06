import React from 'react';
import { Pressable, StyleSheet, TouchableOpacity, View } from 'react-native';

import { router } from 'expo-router';
import { type MatchType } from 'quran-search-engine';

import { HighlightText } from '@/components/HighlightArabic';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useColors } from '@/hooks';
import { QuranText } from '@/types';

/**
 * Structural payload definition configuring search list mapping output.
 */
type SearchResultItemProps = {
  /** A matched document dictionary record containing context strings and IDs. */
  item: QuranText;
  /** Handler fired traversing back to a mapped location within the `MushafPage`. */
  onSelectAya: (aya: { aya: number; surah: number }) => void;
  disabled?: boolean;
  /**
   * Which retrieval path produced this result (AI search adds a badge).
   * `'keyword'` (default) renders without any badge; `'ai'` shows an AI badge;
   * `'both'` shows both keyword and AI badges (RRF merged result).
   */
  matchSource?: 'keyword' | 'ai' | 'both';
  /** Optional Tafseer Al-Muyassar snippet shown below the verse (AI mode). */
  tafseerSnippet?: string;
};

/**
 * A render block component used within lists displaying individual search query hits.
 * Integrates directly with `HighlightText` using `getHighlightRanges` from
 * quran-search-engine to render appropriate color backgrounds on matching tokens.
 *
 * @param props - Mapped document record with filtering states.
 * @returns A touchable card yielding `<HighlightText />` fragments.
 */
export function SearchResultItem({
  item,
  onSelectAya,
  disabled = false,
  matchSource = 'keyword',
  tafseerSnippet,
}: SearchResultItemProps) {
  const { directColor, fuzzyColor, relatedColor, denseColor } = useColors();

  const matchedTokens: string[] = (item as any).matchedTokens || [];
  const tokenTypes: Record<string, MatchType> = (item as any).tokenTypes || {};

  const showAiBadge = matchSource === 'ai' || matchSource === 'both';

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
          {showAiBadge ? (
            <View style={[styles.badge, styles.aiBadge]}>
              <ThemedText style={styles.badgeText}>AI</ThemedText>
            </View>
          ) : null}
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
            matchedTokens={matchedTokens}
            tokenTypes={tokenTypes}
            exactColor={directColor}
            relatedColor={relatedColor}
            fuzzyColor={fuzzyColor}
            denseColor={denseColor}
            style={{ fontSize: 18 }}
          />
        </ThemedText>

        {tafseerSnippet ? (
          <ThemedText type="default" style={styles.tafseer} numberOfLines={3}>
            {tafseerSnippet}
          </ThemedText>
        ) : null}
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
    gap: 8,
    width: '100%',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  aiBadge: {
    backgroundColor: '#26A69A',
  },
  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  tafseer: {
    fontSize: 13,
    lineHeight: 19,
    color: '#666',
    marginTop: 4,
    fontFamily: 'Tajawal_400Regular',
  },
});
