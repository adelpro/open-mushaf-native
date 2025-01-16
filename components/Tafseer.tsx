import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  I18nManager,
  Pressable,
  ScrollView,
  StyleSheet,
} from 'react-native';

import HTMLView from 'react-native-htmlview';
import { useRecoilState } from 'recoil';

import { useColors } from '@/hooks/useColors';
import { tafseerTab } from '@/recoil/atoms';
import { TafseerAya, TafseerTabs } from '@/types';

import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import surahs from '../assets/quran-metadata/mushaf-elmadina-warsh-azrak/surah.json';

const tabLabels: Record<TafseerTabs, string> = {
  katheer: 'ابن كثير',
  maany: 'معاني القرآن',
  earab: 'إعراب القرآن',
  baghawy: 'البغوي',
  muyassar: 'الميسر',
  qortoby: 'القرطبي',
  tabary: 'الطبري',
  saady: 'السعدي',
};

type Props = {
  aya: number;
  surah: number;
  opacity: number;
};

const isRTL = I18nManager.isRTL;

export default function Tafseer({ aya, surah, opacity }: Props) {
  const { tintColor, textColor } = useColors();
  const [surahName, setSurahName] = useState<string>('');
  const [selectedTabValue, setSelectedTab] =
    useRecoilState<TafseerTabs>(tafseerTab);
  const [tafseerData, setTafseerData] = useState<TafseerAya[] | null>(null);

  const renderTafseerContent = (tafseer: TafseerAya[] | null): JSX.Element => {
    const ayaTafseer = tafseer?.find((t) => t.aya === aya && t.sura === surah);

    let tafseerText = 'لا يوجد تفسير.';
    if (!ayaTafseer?.text || ayaTafseer?.text === '<p></p>') {
      tafseerText = '<p>لا يوجد تفسير.</p>';
    } else {
      tafseerText = ayaTafseer?.text;
    }
    return (
      <ScrollView
        style={[
          { overflow: 'scroll' },
          isRTL ? { paddingLeft: 30 } : { paddingRight: 30 },
        ]}
      >
        <HTMLView
          value={tafseerText}
          style={{
            paddingHorizontal: 10,
            backgroundColor: 'transparent',
          }}
          stylesheet={{
            p: {
              color: textColor,
              fontFamily: 'Amiri_400Regular',
              fontSize: 16,
              lineHeight: 24,
              textAlign: isRTL ? 'left' : 'right',
              backgroundColor: 'transparent',
            },
          }}
          addLineBreaks={false}
        />
      </ScrollView>
    );
  };

  useEffect(() => {
    setSurahName(surahs[surah - 1]?.name ?? '');
  }, [surah]);

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

        default:
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
    <ThemedView style={[styles.container, { opacity }]}>
      <ThemedText style={[styles.title, { backgroundColor: 'transparent' }]}>
        {surahName} - الآية {aya}
      </ThemedText>
      <ThemedView style={[styles.tabs, { backgroundColor: 'transparent' }]}>
        {Object.keys(tabLabels).map((key) => {
          const tabKey = key as TafseerTabs;
          return (
            <Pressable
              key={tabKey}
              style={[
                styles.tabButton,
                selectedTabValue === tabKey && styles.activeTab,
                selectedTabValue === tabKey && {
                  borderColor: tintColor,
                },
                { backgroundColor: 'transparent' },
              ]}
              onPress={() => setSelectedTab(tabKey)}
              accessibilityLabel={`${tabLabels[tabKey]} tab for Surah ${surahName}, Aya ${aya}`}
              accessibilityHint={`Tap to see the tafseer for Surah ${surahName}, Aya ${aya} from ${tabLabels[tabKey]}`}
            >
              <ThemedText
                style={{ color: tintColor, backgroundColor: 'transparent' }}
              >
                {tabLabels[tabKey]}
              </ThemedText>
            </Pressable>
          );
        })}
      </ThemedView>

      {tafseerData ? (
        renderTafseerContent(tafseerData)
      ) : (
        <ActivityIndicator size="large" color={tintColor} />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    backgroundColor: 'transparent',
    padding: 5,
  },
  title: {
    fontSize: 18,
    marginBottom: 10,
    padding: 8,
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
});
