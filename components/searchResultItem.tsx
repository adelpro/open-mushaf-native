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
}: SearchResultItemProps) {
  const { directColor, fuzzyColor, relatedColor } = useColors();

  const matchedTokens: string[] = (item as any).matchedTokens || [];
  const tokenTypes: Record<string, MatchType> = (item as any).tokenTypes || {};

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
            matchedTokens={matchedTokens}
            tokenTypes={tokenTypes}
            exactColor={directColor}
            relatedColor={relatedColor}
            fuzzyColor={fuzzyColor}
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
