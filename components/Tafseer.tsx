import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet } from 'react-native';

import { useAtom } from 'jotai/react';
import HTMLView from 'react-native-htmlview';

import { quranTafseerUrl, TafseerKey } from '@/constants/TafseerCdn';
import {
  hasNoTafseerContent,
  useColors,
  useQuranMetadata,
  useTafseerContent,
} from '@/hooks';
import { tafseerTab } from '@/jotai/atoms';
import { TafseerAya } from '@/types';

import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

// Map from internal keys to display labels (matches TafseerKey)
const tabLabels: Record<TafseerKey, string> = {
  katheer: 'إبن كثير',
  maany: 'معاني القرآن',
  earab: 'إعراب القرآن',
  baghawy: 'البغوي',
  muyassar: 'الميسر',
  qortoby: 'القرطبي',
  tabary: 'الطبري',
  saady: 'السعدي',
  'nozool-wahidy': 'أسباب النزول',
  tanweer: 'التحرير و التنوير',
};

type Props = {
  aya: number;
  surah: number;
  opacity?: number;
};

export function Tafseer({ aya, surah, opacity = 1 }: Props) {
  const { tintColor, textColor } = useColors();
  const { surahData, specsData } = useQuranMetadata();
  const { countBesmalAya } = specsData ?? {};

  const [surahName, setSurahName] = useState<string>('');
  const [selectedTab, setSelectedTab] = useAtom(tafseerTab) as [
    TafseerKey,
    (key: TafseerKey) => void,
  ];
  const [tafseerData, setTafseerData] = useState<TafseerAya[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Cache loaded data per tab to avoid repeated fetches
  const [cache, setCache] = useState<Record<TafseerKey, TafseerAya[] | null>>(
    {} as Record<TafseerKey, TafseerAya[] | null>,
  );

  useEffect(() => {
    const currentSurah = surahData.find((s) => s.number === surah);
    setSurahName(currentSurah?.name ?? '');
  }, [surah, surahData]);

  // Fetch tafseer data when selectedTab, surah, or aya changes
  useEffect(() => {
    const fetchTafseer = async () => {
      // If we have cached data for this tab, use it
      if (cache[selectedTab] !== undefined) {
        setTafseerData(cache[selectedTab]);
        setError(null);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const url = quranTafseerUrl(selectedTab);
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        const json = await response.json();
        const data = (json as TafseerAya[]) || [];
        setTafseerData(data);
        // Cache it
        setCache((prev) => ({ ...prev, [selectedTab]: data }));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'فشل تحميل التفسير');
        setTafseerData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchTafseer();
  }, [selectedTab, surah, aya, cache]); // re‑fetch if surah/aya changes (even if cached data exists, we keep it; the hook `useTafseerContent` will filter by surah/aya)

  // Reset cache when surah or aya changes? We could keep cache but the content check might need fresh.
  // Actually we want to keep the data but the hasNoTafseerContent will check within the same surah/aya.
  // So we don't need to reset cache.

  const formattedTafseerHtml = useTafseerContent({
    tafseerData,
    surah,
    aya,
  });

  // Get list of tabs (all keys from tabLabels)
  const tabKeys = Object.keys(tabLabels) as TafseerKey[];

  return (
    <ThemedView
      style={[styles.container, opacity !== undefined ? { opacity } : {}]}
    >
      <ThemedText style={[styles.title, { backgroundColor: 'transparent' }]}>
        {surahName} - الآية {countBesmalAya ? aya : aya - 1}
      </ThemedText>

      <ThemedView style={[styles.tabs, { backgroundColor: 'transparent' }]}>
        {tabKeys.map((tabKey) => {
          const isSelected = tabKey === selectedTab;
          // Only show disabled state if we have loaded the data for this tab and it's empty
          const hasContent =
            cache[tabKey] !== undefined
              ? !hasNoTafseerContent({
                  tafseerData: cache[tabKey],
                  surah,
                  aya,
                })
              : true; // assume it has content until proven otherwise (we can't know without fetch)

          const isDisabled = !hasContent && cache[tabKey] !== undefined;

          return (
            <Pressable
              key={tabKey}
              style={[
                styles.tabButton,
                isSelected && styles.activeTab,
                isSelected && { borderColor: tintColor },
                isDisabled && styles.disabledTab,
                { backgroundColor: 'transparent' },
              ]}
              onPress={() => setSelectedTab(tabKey)}
              accessibilityLabel={`${tabLabels[tabKey]} tab for Surah ${surahName}, Aya ${aya}`}
              accessibilityHint={`Tap to see the tafseer for Surah ${surahName}, Aya ${aya} from ${tabLabels[tabKey]}`}
              disabled={isDisabled}
            >
              <ThemedText
                style={[
                  { color: tintColor, backgroundColor: 'transparent' },
                  isDisabled && styles.disabledTabText,
                ]}
              >
                {tabLabels[tabKey]}
              </ThemedText>
            </Pressable>
          );
        })}
      </ThemedView>

      {loading ? (
        <ActivityIndicator size="large" color={tintColor} />
      ) : error ? (
        <ThemedText style={{ color: 'red', textAlign: 'center', padding: 20 }}>
          {error}
        </ThemedText>
      ) : tafseerData ? (
        <ThemedView style={{ flex: 1 }}>
          {/* @ts-ignore - HTMLView types may be incomplete */}
          <HTMLView
            value={formattedTafseerHtml}
            style={{
              paddingHorizontal: 10,
              paddingVertical: 5,
              backgroundColor: 'transparent',
            }}
            stylesheet={{
              div: {
                color: textColor,
                fontFamily: 'Tajawal_400Regular',
                fontSize: 16,
                lineHeight: 24,
                backgroundColor: 'transparent',
              },
              p: {
                color: textColor,
                fontFamily: 'Tajawal_400Regular',
                fontSize: 16,
                lineHeight: 24,
                flexDirection: 'row',
                backgroundColor: 'transparent',
              },
            }}
            addLineBreaks={false}
          />
        </ThemedView>
      ) : (
        <ThemedText style={{ textAlign: 'center', padding: 20 }}>
          لا يوجد تفسير لهذه الآية
        </ThemedText>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: '100%',
    backgroundColor: 'transparent',
    padding: 5,
  },
  title: {
    fontSize: 18,
    marginBottom: 10,
    padding: 8,
    fontFamily: 'Amiri_400Regular',
  },
  tabs: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 2,
    justifyContent: 'flex-start',
    marginBottom: 10,
  },
  tabButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  activeTab: {
    borderBottomWidth: 2,
  },
  disabledTab: {
    opacity: 0.5,
  },
  disabledTabText: {
    textDecorationLine: 'line-through',
  },
});
