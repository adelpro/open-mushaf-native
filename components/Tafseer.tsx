import React from 'react';

import { useAtom } from 'jotai/react';

import { useQuranMetadata } from '@/hooks';
import { useTafseerData } from '@/hooks/useTafseerData';
import { tafseerTab } from '@/jotai/atoms';

import { styles } from './tafseer/styles';
import { TafseerBody, TafseerTabs } from './tafseer/TafseerView';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
type Props = { aya: number; surah: number; opacity?: number };

export function Tafseer({ aya, surah, opacity = 1 }: Props) {
  const { surahData, specsData } = useQuranMetadata();
  const surahName =
    surahData.find((entry) => entry.number === surah)?.name ?? '';
  const [selectedTab, setSelectedTab] = useAtom(tafseerTab);
  const data = useTafseerData(selectedTab);
  return (
    <ThemedView style={[styles.container, { opacity }]}>
      <ThemedText style={[styles.title, { backgroundColor: 'transparent' }]}>
        {surahName} - الآية {specsData.countBesmalAya ? aya : aya - 1}
      </ThemedText>
      <TafseerTabs
        selectedTab={selectedTab}
        onSelect={setSelectedTab}
        cache={data.cache}
        surah={surah}
        aya={aya}
        surahName={surahName}
      />
      <TafseerBody
        {...data}
        selectedTab={selectedTab}
        surah={surah}
        aya={aya}
      />
    </ThemedView>
  );
}
