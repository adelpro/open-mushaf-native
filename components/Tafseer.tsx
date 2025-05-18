import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet } from 'react-native';

import { useAtom } from 'jotai/react';
import HTMLView from 'react-native-htmlview';

import { useColors } from '@/hooks/useColors';
import useQuranMetadata from '@/hooks/useQuranMetadata';
import {
  hasNoTafseerContent,
  useTafseerContent,
} from '@/hooks/useTafseerContent';
import { tafseerTab } from '@/jotai/atoms';
import { TafseerAya, TafseerTabs } from '@/types';

import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

const tabLabels: Partial<Record<TafseerTabs, string>> = {
  katheer: 'إبن كثير',
  maany: 'معاني القرآن',
  earab: 'إعراب القرآن',
  baghawy: 'البغوي',
  muyassar: 'الميسر',
  qortoby: 'القرطبي',
  tabary: 'الطبري',
  saady: 'السعدي',
  wahidy: 'أسباب النزول',
  tanweer: 'التحرير و التنوير',
  waseet: 'الوسيط',
};

type Props = {
  aya: number;
  surah: number;
  opacity?: number | undefined;
};

export default function Tafseer({ aya, surah, opacity = undefined }: Props) {
  const { tintColor, textColor } = useColors();
  const { surahData } = useQuranMetadata();
  const [surahName, setSurahName] = useState<string>('');
  const [selectedTabValue, setSelectedTab] = useAtom(tafseerTab);
  const [tafseerData, setTafseerData] = useState<TafseerAya[] | null>(null);
  const [tabsWithContent, setTabsWithContent] = useState<
    Record<TafseerTabs, boolean>
  >({} as Record<TafseerTabs, boolean>);

  const formattedTafseerHtml = useTafseerContent({ tafseerData, surah, aya });
  const isCurrentTabEmpty = hasNoTafseerContent({ tafseerData, surah, aya });

  useEffect(() => {
    const currentSurah = surahData.find((s) => s.number === surah);
    setSurahName(currentSurah?.name ?? '');
  }, [surah, surahData]);

  // Add a state to track if we've loaded all tafseer data
  const [allTafseersLoaded, setAllTafseersLoaded] = useState(false);

  // Reset tabsWithContent when surah or aya changes
  useEffect(() => {
    // Reset the content availability state when surah or aya changes
    setTabsWithContent({} as Record<TafseerTabs, boolean>);
    setAllTafseersLoaded(false);
  }, [surah, aya]);

  // Load all tafseer data to check content availability
  useEffect(() => {
    if (!allTafseersLoaded) {
      const loadAllTafseers = async () => {
        const tabsToCheck = Object.keys(tabLabels) as TafseerTabs[];

        for (const tab of tabsToCheck) {
          try {
            let tafseerJSON;

            // Use the same import logic as in loadTafseerData
            switch (tab) {
              case 'baghawy':
                tafseerJSON = await import('@/assets/tafaseer/baghawy.json');
                break;
              case 'earab':
                tafseerJSON = await import('@/assets/tafaseer/earab.json');
                break;
              case 'katheer':
                tafseerJSON = await import('@/assets/tafaseer/katheer.json');
                break;
              case 'maany':
                tafseerJSON = await import('@/assets/tafaseer/maany.json');
                break;
              case 'muyassar':
                tafseerJSON = await import('@/assets/tafaseer/muyassar.json');
                break;
              case 'qortoby':
                tafseerJSON = await import('@/assets/tafaseer/qortoby.json');
                break;
              case 'saady':
                tafseerJSON = await import('@/assets/tafaseer/saady.json');
                break;
              case 'tabary':
                tafseerJSON = await import('@/assets/tafaseer/tabary.json');
                break;
              case 'wahidy':
                tafseerJSON = await import(
                  '@/assets/tafaseer/nozool-wahidy.json'
                );
                break;
              case 'tanweer':
                tafseerJSON = await import('@/assets/tafaseer/tanweer.json');
                break;
              case 'waseet':
                tafseerJSON = await import('@/assets/tafaseer/waseet.json');
                break;
              default:
                continue;
            }

            const data =
              (tafseerJSON?.default as TafseerAya[]) ||
              (tafseerJSON as TafseerAya[]);
            const hasContent = !hasNoTafseerContent({
              tafseerData: data,
              surah,
              aya,
            });

            setTabsWithContent((prev) => ({
              ...prev,
              [tab]: hasContent,
            }));
          } catch {
            // If there's an error loading the tafseer, mark it as not having content
            setTabsWithContent((prev) => ({
              ...prev,
              [tab]: false,
            }));
          }
        }

        setAllTafseersLoaded(true);
      };

      loadAllTafseers();
    }
  }, [surah, aya, allTafseersLoaded]);

  const loadTafseerData = useCallback(async () => {
    let tafseerJSON;
    try {
      switch (selectedTabValue) {
        case 'baghawy':
          tafseerJSON = await import('@/assets/tafaseer/baghawy.json');
          break;
        case 'earab':
          tafseerJSON = await import('@/assets/tafaseer/earab.json');
          break;
        case 'katheer':
          tafseerJSON = await import('@/assets/tafaseer/katheer.json');
          break;
        case 'maany':
          tafseerJSON = await import('@/assets/tafaseer/maany.json');
          break;
        case 'muyassar':
          tafseerJSON = await import('@/assets/tafaseer/muyassar.json');
          break;
        case 'qortoby':
          tafseerJSON = await import('@/assets/tafaseer/qortoby.json');
          break;
        case 'saady':
          tafseerJSON = await import('@/assets/tafaseer/saady.json');
          break;
        case 'tabary':
          tafseerJSON = await import('@/assets/tafaseer/tabary.json');
          break;
        case 'wahidy':
          tafseerJSON = await import('@/assets/tafaseer/nozool-wahidy.json');
          break;
        case 'tanweer':
          tafseerJSON = await import('@/assets/tafaseer/tanweer.json');
          break;
        case 'waseet':
          tafseerJSON = await import('@/assets/tafaseer/waseet.json');
          break;
        default:
          // Fallback to katheer if the selected tab is somehow not in the list
          // or if it's one of the newly added ones and something went wrong.
          // However, with the fixes, this default should ideally not be hit for tanweer/waseet.
          tafseerJSON = await import('@/assets/tafaseer/katheer.json');
      }
      setTafseerData(
        (tafseerJSON.default as TafseerAya[]) || (tafseerJSON as TafseerAya[]),
      );
    } catch {
      setTafseerData(null);
    }
  }, [selectedTabValue]);

  useEffect(() => {
    loadTafseerData();
  }, [loadTafseerData]);

  return (
    <ThemedView
      style={[styles.container, opacity !== undefined ? { opacity } : {}]}
    >
      <ThemedText style={[styles.title, { backgroundColor: 'transparent' }]}>
        {surahName} - الآية {aya}
      </ThemedText>
      <ThemedView style={[styles.tabs, { backgroundColor: 'transparent' }]}>
        {Object.keys(tabLabels).map((key) => {
          const tabKey = key as TafseerTabs;

          // Use tabsWithContent to check if the tab has content
          // For the current tab, use isCurrentTabEmpty as a fallback if not yet in tabsWithContent
          const isCurrentTab = tabKey === selectedTabValue;
          const hasNoContent =
            tabsWithContent[tabKey] === false ||
            (isCurrentTab &&
              isCurrentTabEmpty &&
              tabsWithContent[tabKey] === undefined);

          return (
            <Pressable
              key={tabKey}
              style={[
                styles.tabButton,
                selectedTabValue === tabKey && styles.activeTab,
                selectedTabValue === tabKey && {
                  borderColor: tintColor,
                },
                hasNoContent && styles.disabledTab,
                { backgroundColor: 'transparent' },
              ]}
              onPress={() => setSelectedTab(tabKey)}
              accessibilityLabel={`${tabLabels[tabKey]} tab for Surah ${surahName}, Aya ${aya}`}
              accessibilityHint={`Tap to see the tafseer for Surah ${surahName}, Aya ${aya} from ${tabLabels[tabKey]}`}
            >
              <ThemedText
                style={[
                  { color: tintColor, backgroundColor: 'transparent' },
                  hasNoContent && styles.disabledTabText,
                ]}
              >
                {tabLabels[tabKey]}
              </ThemedText>
            </Pressable>
          );
        })}
      </ThemedView>

      {tafseerData ? (
        <ThemedView style={{ flex: 1 }}>
          {/* @ts-ignore - Ignoring type error for HTMLView component */}
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
        <ActivityIndicator size="large" color={tintColor} />
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
