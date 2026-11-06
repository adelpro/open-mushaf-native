import { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';

import {
  Seo,
  TermsContentArabic,
  TermsContentEnglish,
  ThemedText,
  ThemedView,
} from '@/components';
import { Colors } from '@/constants/Colors';
import { isRTL } from '@/utils';

/**
 * Public Terms of Service route (`/terms`), reachable on the web at
 * quran.us.kg/terms and from the More menu inside the app.
 *
 * The Arabic and English versions share one scrollable page, switched with the
 * same language tabs used by the privacy policy.
 */
export default function TermsScreen() {
  const [selectedTab, setSelectedTab] = useState<'arabic' | 'english'>(
    'arabic',
  );
  const colorScheme = useColorScheme();
  const currentColor = Colors[colorScheme ?? 'light'].tint;
  const backgroundColor = Colors[colorScheme ?? 'light'].background;

  return (
    <ThemedView style={styles.container}>
      <Seo
        title="المصحف المفتوح - شروط الاستخدام"
        description="شروط استخدام خدمات Quran.us.kg: الاستخدام المقبول، دقة المحتوى القرآني، الملكية الفكرية، واجهات API وخوادم MCP، والمسؤولية."
        url="https://quran.us.kg/terms"
        canonical="https://quran.us.kg/terms"
      />

      <View style={styles.column}>
        <ThemedView style={styles.tabContainer}>
          <TouchableOpacity
            style={[
              styles.tab,
              selectedTab === 'arabic' && {
                backgroundColor,
                borderBottomWidth: 2,
                borderBottomColor: currentColor,
              },
            ]}
            onPress={() => {
              setSelectedTab('arabic');
            }}
            accessibilityRole="tab"
            accessibilityLabel="العربية"
            accessibilityState={{ selected: selectedTab === 'arabic' }}
            accessibilityHint="اضغط لعرض شروط الاستخدام بالعربية"
          >
            <ThemedText
              style={[
                styles.tabText,
                selectedTab === 'arabic' && { color: currentColor },
              ]}
            >
              العربية
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tab,
              selectedTab === 'english' && {
                backgroundColor,
                borderBottomWidth: 2,
                borderBottomColor: currentColor,
              },
            ]}
            onPress={() => {
              setSelectedTab('english');
            }}
            accessibilityRole="tab"
            accessibilityLabel="English"
            accessibilityState={{ selected: selectedTab === 'english' }}
            accessibilityHint="Press to view the terms of service in English"
          >
            <ThemedText
              style={[
                styles.tabText,
                selectedTab === 'english' && { color: currentColor },
              ]}
            >
              English
            </ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {selectedTab === 'arabic' ? (
          <TermsContentArabic />
        ) : (
          <TermsContentEnglish />
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  column: {
    width: '100%',
    maxWidth: 640,
    alignSelf: 'center',
    paddingHorizontal: 20,
  },
  tabContainer: {
    flexDirection: isRTL ? 'row' : 'row-reverse',
    justifyContent: 'space-around',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 18,
    fontWeight: '600',
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
