import React from 'react';
import { Pressable, StyleSheet, TouchableOpacity, View } from 'react-native';

import { router } from 'expo-router';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import type { SearchHit } from '@/utils/api/qurani';

/**
 * Structural payload definition configuring search list mapping output.
 *
 * Phase 5 update: `item` is the qurani.ai `QuranApiAyah` (gid +
 * surah + numberInSurah + text + page + juz). Highlighting is
 * done by the qurani.ai `normalizedKeyword` field — we keep a
 * simple plain-text renderer here; richer highlighting can be
 * added later without changing this component's contract.
 */
type SearchResultItemProps = {
  /** A matched ayah record from `/search/<keyword>`. */
  item: SearchHit;
  /** Handler fired when the user taps the verse. */
  onSelectAya: (aya: {
    gid: number;
    surah: number;
    numberInSurah: number;
  }) => void;
  disabled?: boolean;
};

/**
 * A render block component used within lists displaying individual
 * search query hits.
 *
 * @param props - Mapped ayah record + selection handler.
 * @returns A touchable card with the verse header + verse text.
 */
export function SearchResultItem({
  item,
  onSelectAya,
  disabled = false,
}: SearchResultItemProps) {
  return (
    <TouchableOpacity
      onPress={() =>
        onSelectAya({
          gid: item.number,
          surah: item.surah.number,
          numberInSurah: item.numberInSurah,
        })
      }
      accessibilityLabel={`سورة ${item.surah.name} الآية ${item.numberInSurah}`}
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
                params: { page: item.page.toString(), temporary: 'true' },
              })
            }
          >
            <ThemedText type="link">{`سورة: ${item.surah.name} - الآية: ${item.numberInSurah}`}</ThemedText>
          </Pressable>
        </View>

        <ThemedText type="default" style={styles.uthmani}>
          {item.text}
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
