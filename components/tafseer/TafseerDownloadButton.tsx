import { Pressable } from 'react-native';

import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { useColors } from '@/hooks';

import { ThemedText } from '../ThemedText';
import { styles } from './styles';

export function TafseerDownloadButton() {
  const router = useRouter();
  const { primaryColor } = useColors();
  return (
    <Pressable
      onPress={() => {
        router.push('/downloads');
      }}
      style={({ pressed }) => [
        styles.notDownloadedCta,
        {
          backgroundColor: primaryColor + '15',
          borderColor: primaryColor + '55',
          opacity: pressed ? 0.7 : 1,
        },
      ]}
      accessibilityRole="button"
      accessibilityLabel="افتح صفحة التنزيلات"
    >
      <Feather name="download" size={16} color={primaryColor} />
      <ThemedText
        style={[styles.notDownloadedCtaLabel, { color: primaryColor }]}
      >
        افتح التنزيلات
      </ThemedText>
    </Pressable>
  );
}
