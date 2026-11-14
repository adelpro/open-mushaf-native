import { TafseerKey, TAFSEERS_LIST } from '@/constants/TafseerCdn';
import { TafseerAya } from '@/types';

import { ThemedView } from '../ThemedView';
import { styles } from './styles';
import { TafseerTab } from './TafseerTab';
type TabProps = {
  selectedTab: TafseerKey;
  onSelect: (key: TafseerKey) => void;
  cache: ReadonlyMap<TafseerKey, TafseerAya[]>;
  surah: number;
  aya: number;
  surahName: string;
};

export function TafseerTabs(props: TabProps) {
  return (
    <ThemedView style={[styles.tabs, { backgroundColor: 'transparent' }]}>
      {TAFSEERS_LIST.map((tabKey) => {
        return <TafseerTab key={tabKey} tabKey={tabKey} {...props} />;
      })}
    </ThemedView>
  );
}
