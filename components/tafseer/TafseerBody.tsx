import { ActivityIndicator } from 'react-native';

import { TafseerKey } from '@/constants/TafseerCdn';
import { useColors, useTafseerContent } from '@/hooks';
import { TafseerAya } from '@/types';

import { ThemedText } from '../ThemedText';
import { TafseerDownloadPrompt } from './TafseerDownloadPrompt';
import { TafseerHtml } from './TafseerHtml';
type BodyProps = {
  selectedTab: TafseerKey;
  surah: number;
  aya: number;
  loading: boolean;
  error: string | null;
  tafseerData: TafseerAya[] | null;
};

export function TafseerBody({
  surah,
  aya,
  loading,
  error,
  tafseerData,
}: BodyProps) {
  const { tintColor } = useColors();
  const html = useTafseerContent({ tafseerData, surah, aya });
  if (loading) return <ActivityIndicator size="large" color={tintColor} />;
  if (error)
    return (
      <ThemedText style={{ color: 'red', textAlign: 'center', padding: 20 }}>
        {error}
      </ThemedText>
    );
  if (!tafseerData) return <TafseerDownloadPrompt />;
  return <TafseerHtml html={html} />;
}
