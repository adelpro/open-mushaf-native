import { useEffect, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  useColorScheme,
} from 'react-native';

import HTMLView from 'react-native-htmlview';
import { useRecoilState } from 'recoil';

import tafaseer from '@/assets/tafaseer';
import { Colors } from '@/constants';
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
      <ThemedView style={styles.tafseerContent}>
        <HTMLView
          value={tafseerText}
          stylesheet={{ p: { color: textColor } }}
        />
      </ThemedView>
    );
  };

  useEffect(() => {
    setSurahName(surahs[surah]?.name ?? '');
  }, [surah]);

  useEffect(() => {
    setTafseerData(tafaseer[selectedTabValue] as TafseerAya[]);
  }, [selectedTabValue]);
  return (
    <ScrollView
      contentContainerStyle={[styles.scrollView, { backgroundColor, opacity }]}
    >
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
      {renderTafseerContent(tafseerData)}
    </ScrollView>
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
