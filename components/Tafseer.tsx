// components/Tafseer.tsx

import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, useColorScheme } from 'react-native';

import HTMLView from 'react-native-htmlview';
import { useRecoilState } from 'recoil';

//import surahs from '@/assets/quran-metadata/mushaf-elmadina-warsh-azrak/surah.json';
import { Colors } from '@/constants';
import { tafseerTab } from '@/recoil/atoms';
import { TafseerAya, TafseerTabs } from '@/types';
//import { loadTafseerChunk } from '@/utils';

import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

const tabLabels: Record<TafseerTabs, string> = {
  katheer: 'ابن كثير',
  maany: 'معاني القرآن',
  earab: 'إعراب القرآن',
  baghawy: 'البغوي',
  muyassar: 'الميسر',
  qortoby: 'القرطبي',
  tabary: 'الطبري',
  saady: 'السعدي',
  tanweer: 'التحرير و التنوير',
  waseet: 'الوسيط',
};

type Props = {
  aya: number;
  surah: number;
  opacity: number;
};

export default function Tafseer({ aya, surah, opacity }: Props) {
  const colorScheme = useColorScheme();
  const tintColor = Colors[colorScheme ?? 'light'].tint;
  const textColor = Colors[colorScheme ?? 'light'].text;
  const backgroundColor = Colors[colorScheme ?? 'light'].background;
  const [surahName, setSurahName] = useState<string>('');
  const [selectedTabValue, setSelectedTab] =
    useRecoilState<TafseerTabs>(tafseerTab);
  const [tafseerData, setTafseerData] = useState<TafseerAya | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const loadTafseerData = useCallback(async () => {
    setIsLoading(true);
    try {
      console.log(
        `Loading tafseer for surah ${surah} and aya ${aya} with tab ${selectedTabValue}`,
      );
      const data = null;
      setTafseerData(data);
    } catch (error) {
      if (error instanceof Error) {
        setError(`خطأ في تحميل التفسير : ${error?.message}`);
      } else {
        setError('خطأ في تحميل التفسير');
      }
      setTafseerData(null);
    } finally {
      setIsLoading(false);
    }
  }, [selectedTabValue, surah, aya]);

  useEffect(() => {
    setSurahName('ff');
    loadTafseerData();
  }, [surah, aya, selectedTabValue, loadTafseerData]);

  const renderTafseerContent = (): JSX.Element => {
    if (isLoading) {
      return <ThemedText>جاري التحميل...</ThemedText>;
    }

    if (error) {
      return <ThemedText>{error}</ThemedText>;
    }
    console.log('tafseerData', tafseerData);
    let tafseerText = 'لا يوجد تفسير.';
    if (tafseerData?.text && tafseerData?.text !== '<p></p>') {
      tafseerText = tafseerData.text;
    }
    return (
      <ThemedView style={styles.tafseerContent}>
        <HTMLView
          value={tafseerText}
          stylesheet={{
            p: { color: textColor, fontFamily: 'Amiri_400Regular' },
          }}
        />
      </ThemedView>
    );
  };

  return (
    <FlatList
      ListHeaderComponent={() => (
        <>
          <ThemedText style={styles.title}>
            {surahName} - الآية {aya}
          </ThemedText>
          <ThemedView style={styles.tabs}>
            {Object.keys(tabLabels).map((key) => {
              const tabKey = key as TafseerTabs;
              return (
                <Pressable
                  key={tabKey}
                  style={[
                    styles.tabButton,
                    selectedTabValue === tabKey && styles.activeTab,
                    selectedTabValue === tabKey && { borderColor: tintColor },
                  ]}
                  onPress={() => setSelectedTab(tabKey)}
                >
                  <ThemedText>{tabLabels[tabKey]}</ThemedText>
                </Pressable>
              );
            })}
          </ThemedView>
        </>
      )}
      data={[{ key: 'tafseer' }]}
      renderItem={renderTafseerContent}
      contentContainerStyle={[styles.scrollView, { backgroundColor, opacity }]}
    />
  );
}

const styles = StyleSheet.create({
  scrollView: {
    padding: 20,
  },
  title: {
    fontSize: 18,
    marginBottom: 10,
  },
  tabs: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 2,
    justifyContent: 'flex-start',
  },
  tabButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  activeTab: {
    borderBottomWidth: 2,
  },
  tafseerContent: {
    marginBottom: 20,
    marginTop: 20,
  },
});
