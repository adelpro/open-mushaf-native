import { ScrollView, StyleSheet } from 'react-native';

import { Seo, TermsContentEnglish, ThemedView } from '@/components';

/**
 * Public Terms of Service route (`/terms`), reachable on the web at
 * quran.us.kg/terms and from the More menu inside the app.
 */
export default function TermsScreen() {
  return (
    <ThemedView style={styles.container}>
      <Seo
        title="المصحف المفتوح - شروط الاستخدام"
        description="شروط استخدام خدمات Quran.us.kg: الاستخدام المقبول، دقة المحتوى القرآني، الملكية الفكرية، واجهات API وخوادم MCP، والمسؤولية."
        url="https://quran.us.kg/terms"
        canonical="https://quran.us.kg/terms"
      />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <TermsContentEnglish />
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    width: '100%',
    maxWidth: 640,
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 48,
  },
});
