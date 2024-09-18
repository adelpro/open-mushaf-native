import React, { useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  PanResponder,
  Pressable,
  ScrollView,
  StyleSheet,
} from 'react-native';

import WebView from 'react-native-webview';
import { useRecoilState } from 'recoil';

import { popupHeight, tafseerTab } from '@/recoil/atoms';
import { TafseerAya, TafseerTabs } from '@/types';

import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import surahs from '../assets/quran-metadata/mushaf-elmadina-warsh-azrak/surah.json';
import baghawy from '../assets/tafaseer/baghawy.json';
import earab from '../assets/tafaseer/earab.json';
import katheer from '../assets/tafaseer/katheer.json';
import maany from '../assets/tafaseer/maany.json';
import muyassar from '../assets/tafaseer/muyassar.json';
import qortoby from '../assets/tafaseer/qortoby.json';
import saady from '../assets/tafaseer/saady.json';
import tabary from '../assets/tafaseer/tabary.json';
import tanweer from '../assets/tafaseer/tanweer.json';
import waseet from '../assets/tafaseer/waseet.json';

type Props = {
  show: boolean;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
  aya: number;
  surah: number;
};

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

export default function TafseerPopup({ show, setShow, aya, surah }: Props) {
  const [popupHeightValue, setPopupHeight] =
    useRecoilState<number>(popupHeight);
  const [isResizing, setIsResizing] = useState(false);
  const [selectedTabValue, setSelectedTab] =
    useRecoilState<TafseerTabs>(tafseerTab);
  const [tafseerData, setTafseerData] = useState<TafseerAya[] | null>(null);
  const [surahName, setSurahName] = useState<string>('');
  const popupRef = useRef(null);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_evt, gestureState) => {
        if (isResizing && popupRef.current) {
          const newHeight =
            Dimensions.get('window').height - gestureState.moveY;
          setPopupHeight(Math.max(30, newHeight));
        }
      },
      onPanResponderRelease: () => setIsResizing(false),
    }),
  ).current;

  const renderTafseerContent = (tafseer: TafseerAya[] | null): JSX.Element => {
    let tafseerText: string = '';
    if (tafseer) {
      const ayaTafseer = tafseer.find((t) => t.aya === aya && t.sura === surah);
      if (ayaTafseer) {
        tafseerText = ayaTafseer.text;
      }
    }
    if (!tafseerText) {
      tafseerText = 'لا يوجد تفسير.';
    }

    return (
      <ThemedView style={styles.tafseerContent}>
        <WebView originWhitelist={['*']} source={{ html: tafseerText }} />
      </ThemedView>
    );
  };

  useEffect(() => {
    setSurahName(surahs[surah]?.name);
  }, [surah]);

  useEffect(() => {
    switch (selectedTabValue) {
      case 'katheer':
        setTafseerData(katheer as TafseerAya[]);
        break;
      case 'maany':
        setTafseerData(maany as TafseerAya[]);
        break;
      case 'earab':
        setTafseerData(earab as TafseerAya[]);
        break;
      case 'baghawy':
        setTafseerData(baghawy as TafseerAya[]);
        break;
      case 'muyassar':
        setTafseerData(muyassar as TafseerAya[]);
        break;
      case 'qortoby':
        setTafseerData(qortoby as TafseerAya[]);
        break;
      case 'tabary':
        setTafseerData(tabary as TafseerAya[]);
        break;
      case 'saady':
        setTafseerData(saady as TafseerAya[]);
        break;
      case 'tanweer':
        setTafseerData(tanweer as TafseerAya[]);
        break;
      case 'waseet':
        setTafseerData(waseet as TafseerAya[]);
        break;
    }
  }, [selectedTabValue]);

  return show ? (
    <ThemedView style={styles.overlay}>
      <Pressable style={styles.background} onPress={() => setShow(false)}>
        <Pressable
          ref={popupRef}
          style={[styles.popup, { height: popupHeightValue }]}
          onPress={(e) => e.stopPropagation()}
          {...panResponder.panHandlers}
        >
          {/* // FIXME: fix reizing not working */}
          <Pressable
            style={styles.resizer}
            onPressIn={() => setIsResizing(true)}
          >
            <ThemedText style={styles.resizerText}>⇕</ThemedText>
          </Pressable>
          <ScrollView contentContainerStyle={styles.scrollView}>
            <Pressable onPress={() => setShow(false)}>
              <ThemedText style={styles.closeButton}>✕</ThemedText>
            </Pressable>
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
        </Pressable>
      </Pressable>
    </ThemedView>
  ) : null;
}
const styles = StyleSheet.create({
  overlay: {
    position: 'absolute', // Changed from 'relative' to 'absolute'
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: 'flex-end',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
  },
  background: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  popup: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: '100%',
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    shadowOffset: { width: 0, height: 2 },
    elevation: 5,
  },
  resizer: {
    alignSelf: 'center',
    padding: 10,
  },
  resizerText: {
    fontSize: 20,
  },
  scrollView: {
    padding: 20,
  },
  closeButton: {
    alignSelf: 'flex-end',
    fontSize: 24,
  },
  title: {
    fontSize: 18,
    marginBottom: 10,
  },
  tabs: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  tabButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderColor: '#007BFF',
  },
  tafseerContent: {
    marginTop: 20,
  },
});
