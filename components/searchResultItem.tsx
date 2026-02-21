import React from 'react';
import { Pressable, StyleSheet, TouchableOpacity, View } from 'react-native';

import { router } from 'expo-router';
import { type QuranText, type WordMap } from 'quran-search-engine';

import { HighlightText } from '@/components/HighlightArabic';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useColors } from '@/hooks/useColors';

type SearchResultItemProps = {
  item: QuranText;
  query: string;
  advancedOptions: { lemma: boolean; root: boolean; fuzzy: boolean };
  wordMap: WordMap;
  getPositiveTokens: (
    verse: QuranText,
    mode: 'text' | 'lemma' | 'root' | 'fuzzy',
    targetLemma?: string,
    targetRoot?: string,
    cleanQuery?: string,
  ) => string[];
  onSelectAya: (aya: { aya: number; surah: number }) => void;
};

export default function SearchResultItem({
  item,
  query,
  advancedOptions,
  wordMap,
  getPositiveTokens,
  onSelectAya,
}: SearchResultItemProps) {
  const { directColor, fuzzyColor, relatedColor, iconColor } = useColors();
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

  // إعداد نص وصفي للمكفوفين يلخص النتيجة
  const accessibilityLabelText = `سورة ${item.sura_name}، آية ${item.aya_id}. النص: ${item.standard}.`;

  return (
    <TouchableOpacity
      onPress={() => onSelectAya({ aya: item.aya_id, surah: item.sura_id })}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabelText}
      accessibilityHint="اضغط لعرض الآية في المصحف"
    >
      <ThemedView style={[styles.item, { borderBottomColor: iconColor }]}>
        <View style={styles.header}>
          <Pressable
            onPress={() =>
              router.replace({
                pathname: '/',
                params: { page: item.page_id.toString(), temporary: 'true' },
              })
            }
            accessible={true}
            accessibilityRole="link"
            accessibilityLabel={`الانتقال إلى صفحة ${item.page_id} في المصحف`}
          >
            <ThemedText type="link" style={styles.headerText}>
              {`سورة: ${item.sura_name} - الآية: ${item.aya_id}`}
            </ThemedText>
          </Pressable>
        </View>

        <ThemedText
          type="default"
          style={styles.uthmani}
          importantForAccessibility="no-hide-descendants" // نخفي النص الداخلي لأننا قرأناه في الـ Label بالأعلى لمنع التكرار
        >
          <HighlightText
            text={item.standard}
            tokens={directTokens}
            relatedWords={relatedTokens}
            fuzzyWords={fuzzyTokens}
            color={directColor}
            relatedColor={relatedColor}
            fuzzyColor={fuzzyColor}
            style={{ fontSize: 20 }}
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
  uthmani: {
    paddingVertical: 10,
    fontFamily: 'Amiri_400Regular',
    textAlign: 'right',
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    width: '100%',
  },
  headerText: {
    fontFamily: 'Tajawal_500Medium',
    fontSize: 14,
  },
});
