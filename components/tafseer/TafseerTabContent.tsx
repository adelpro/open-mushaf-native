import { Feather } from '@expo/vector-icons';

import { TafseerKey } from '@/constants/TafseerCdn';
import { useColors, useDownloadStatus } from '@/hooks';

import { ThemedText } from '../ThemedText';
import { styles } from './styles';

export function TafseerTabContent({
  tabKey,
  label,
  isDisabled,
}: {
  tabKey: TafseerKey;
  label: string;
  isDisabled: boolean;
}) {
  const { tintColor, primaryColor } = useColors();
  const { tafseerIsDownloaded } = useDownloadStatus();
  const isDownloaded = tafseerIsDownloaded(tabKey);
  return (
    <>
      <ThemedText
        style={[
          { color: tintColor, backgroundColor: 'transparent' },
          isDisabled && styles.disabledTabText,
        ]}
      >
        {label}
      </ThemedText>
      <Feather
        name={isDownloaded ? 'check-circle' : 'download'}
        size={11}
        color={isDownloaded ? primaryColor : tintColor + '88'}
        style={styles.tabDownloadedBadge}
      />
    </>
  );
}
