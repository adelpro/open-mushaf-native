import { Pressable } from 'react-native';

import { getTafseerLabel, TafseerKey } from '@/constants/TafseerCdn';
import { hasNoTafseerContent, useColors } from '@/hooks';
import { TafseerAya } from '@/types';

import { styles } from './styles';
import { TafseerTabContent } from './TafseerTabContent';
type TabProps = {
  selectedTab: TafseerKey;
  onSelect: (key: TafseerKey) => void;
  cache: ReadonlyMap<TafseerKey, TafseerAya[]>;
  surah: number;
  aya: number;
  surahName: string;
};

export function TafseerTab({
  tabKey,
  selectedTab,
  onSelect,
  cache,
  surah,
  aya,
  surahName,
}: TabProps & { tabKey: TafseerKey }) {
  const { tintColor } = useColors();
  const data = cache.get(tabKey);
  const isDisabled =
    data !== undefined &&
    hasNoTafseerContent({ tafseerData: data, surah, aya });
  const isSelected = tabKey === selectedTab;
  const label = getTafseerLabel(tabKey);
  return (
    <Pressable
      style={[
        styles.tabButton,
        isSelected && styles.activeTab,
        isSelected && { borderColor: tintColor },
        isDisabled && styles.disabledTab,
        { backgroundColor: 'transparent' },
      ]}
      onPress={() => {
        onSelect(tabKey);
      }}
      accessibilityLabel={
        label + ' tab for Surah ' + surahName + ', Aya ' + aya
      }
      accessibilityHint={
        'Tap to see the tafseer for Surah ' +
        surahName +
        ', Aya ' +
        aya +
        ' from ' +
        label
      }
      disabled={isDisabled}
    >
      <TafseerTabContent
        tabKey={tabKey}
        label={label}
        isDisabled={isDisabled}
      />
    </Pressable>
  );
}
