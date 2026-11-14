import { TouchableOpacity } from 'react-native';

import { Surah } from '@/types';

import { styles } from './SurahAyaNavigator.styles';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
type Props = {
  item: Surah;
  selected: boolean;
  primaryColor: string;
  onSelect: (surah: number) => void;
};
export function SurahListItem(props: Props) {
  const { item, selected, primaryColor, onSelect } = props;
  return (
    <TouchableOpacity
      style={[
        styles.modalItem,
        selected && {
          backgroundColor: primaryColor + '20',
        },
      ]}
      onPress={() => onSelect(item.number)}
      accessibilityLabel={`سورة ${item.name}`}
    >
      <ThemedText style={styles.surahNumber}>{item.number}</ThemedText>
      <ThemedView
        style={[
          styles.separator,
          {
            backgroundColor: 'transparent',
            borderColor: primaryColor + '40',
            borderLeftWidth: 1,
            borderRightWidth: 1,
            borderStyle: 'dotted',
          },
        ]}
      />
      <ThemedText style={styles.surahName}>{item.name}</ThemedText>
      <ThemedText style={styles.surahInfo}>{item.numberOfAyahs} آية</ThemedText>
    </TouchableOpacity>
  );
}
