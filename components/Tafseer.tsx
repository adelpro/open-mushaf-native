import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
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
  tanweer: 'التحرير و التنوير',
  waseet: 'الوسيط',
};

type Props = {
  aya: number;
  surah: number;
  opacity: number;
};
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
      <ThemedView
        style={[styles.tafseerContent, { backgroundColor: 'transparent' }]}
      >
        <HTMLView
          value={tafseerText}
          style={{ backgroundColor: 'transparent' }}
          stylesheet={{
            p: {
              color: textColor,
              fontFamily: 'Amiri_400Regular',
              backgroundColor: 'transparent',
            },
          }}
        />
      </ThemedView>
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
        case 'tanweer':
          tafseerJSON = await import('@/assets/tafaseer/tanweer.json');
          break;
        case 'waseet':
          tafseerJSON = await import('@/assets/tafaseer/waseet.json');
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
        <ScrollView
          contentContainerStyle={[
            styles.scrollView,
            { backgroundColor: 'transparent' },
          ]}
        >
          {renderTafseerContent(tafseerData)}
        </ScrollView>
      ) : (
        <ActivityIndicator size="large" color={tintColor} />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    padding: 20,
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
