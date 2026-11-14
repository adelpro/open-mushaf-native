import { Feather } from '@expo/vector-icons';

import { useColors } from '@/hooks';

import { ThemedText } from '../ThemedText';
import { ThemedView } from '../ThemedView';
import { styles } from './styles';
import { TafseerDownloadButton } from './TafseerDownloadButton';

export function TafseerDownloadPrompt() {
  const { tintColor, primaryColor } = useColors();
  return (
    <ThemedView
      style={[styles.notDownloadedCard, { borderColor: tintColor + '44' }]}
    >
      <Feather
        name="cloud-off"
        size={28}
        color={primaryColor}
        style={{ marginBottom: 6 }}
      />
      <ThemedText type="defaultSemiBold" style={{ textAlign: 'center' }}>
        هذا التفسير غير محمّل للقراءة دون اتصال
      </ThemedText>
      <ThemedText
        style={{
          fontSize: 12,
          opacity: 0.6,
          textAlign: 'center',
          marginTop: 6,
          marginBottom: 12,
        }}
      >
        لن يتم تنزيل هذا التفسير تلقائيًا. افتح صفحة التنزيلات لإضافته إلى
        جهازك.
      </ThemedText>
      <TafseerDownloadButton />
    </ThemedView>
  );
}
