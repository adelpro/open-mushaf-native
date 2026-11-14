import { useState } from 'react';
import {
  ScrollView,
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
import { styles } from '@/styles/screens/terms.styles';

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

  function renderTab() {
    return (
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
    );
  }

  function renderColumn() {
    function renderTabContainer() {
      function renderTab2() {
        return (
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
        );
      }
      return (
        <ThemedView style={styles.tabContainer}>
          {renderTab()}
          {renderTab2()}
        </ThemedView>
      );
    }
    return <View style={styles.column}>{renderTabContainer()}</View>;
  }
  return (
    <ThemedView style={styles.container}>
      <Seo
        title="المصحف المفتوح - شروط الاستخدام"
        description="شروط استخدام خدمات Quran.us.kg: الاستخدام المقبول، دقة المحتوى القرآني، الملكية الفكرية، واجهات API وخوادم MCP، والمسؤولية."
        url="https://quran.us.kg/terms"
        canonical="https://quran.us.kg/terms"
      />

      {renderColumn()}

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
