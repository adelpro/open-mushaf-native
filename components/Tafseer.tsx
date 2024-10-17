import { useEffect, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  useColorScheme,
} from 'react-native';

import HTMLView from 'react-native-htmlview';
import { useRecoilState } from 'recoil';

import baghawyJSON from '@/assets/tafaseer/baghawy.json';
import earabJSON from '@/assets/tafaseer/earab.json';
import katheerJSON from '@/assets/tafaseer/katheer.json';
import maanyJSON from '@/assets/tafaseer/maany.json';
import muyassarJSON from '@/assets/tafaseer/muyassar.json';
import qortobyJSON from '@/assets/tafaseer/qortoby.json';
import saadyJSON from '@/assets/tafaseer/saady.json';
import tabaryJSON from '@/assets/tafaseer/tabary.json';
import tanweerJSON from '@/assets/tafaseer/tanweer.json';
import waseetJSON from '@/assets/tafaseer/waseet.json';
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
          stylesheet={{
            p: { color: textColor, fontFamily: 'Amiri_400Regular' },
          }}
        />
      </ThemedView>
    );
  };

  useEffect(() => {
    setSurahName(surahs[surah - 1]?.name ?? '');
  }, [surah]);

  useEffect(() => {
    switch (selectedTabValue) {
      case 'baghawy':
        setTafseerData(baghawyJSON as TafseerAya[]);
        break;
      case 'earab':
        setTafseerData(earabJSON as TafseerAya[]);
        break;
      case 'katheer':
        setTafseerData(katheerJSON as TafseerAya[]);
        break;
      case 'maany':
        setTafseerData(maanyJSON as TafseerAya[]);
        break;
      case 'muyassar':
        setTafseerData(muyassarJSON as TafseerAya[]);
        break;
      case 'qortoby':
        setTafseerData(qortobyJSON as TafseerAya[]);
        break;
      case 'saady':
        setTafseerData(saadyJSON as TafseerAya[]);
        break;
      case 'tabary':
        setTafseerData(tabaryJSON as TafseerAya[]);
        break;
      case 'tanweer':
        setTafseerData(tanweerJSON as TafseerAya[]);
        break;
      case 'waseet':
        setTafseerData(waseetJSON as TafseerAya[]);
        break;
      default:
        setTafseerData(katheerJSON as TafseerAya[]);
    }
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
