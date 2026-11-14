import { useState } from 'react';
import { ScrollView, TouchableOpacity, useColorScheme } from 'react-native';

import {
  PrivacyContentArabic,
  PrivacyContentEnglish,
  Seo,
  ThemedText,
  ThemedView,
} from '@/components';
import { Colors } from '@/constants/Colors';
import { styles } from '@/styles/screens/privacy.styles';

export default function PrivacyScreen() {
  const [selectedTab, setSelectedTab] = useState('arabic'); // Default to Arabic
  const colorScheme = useColorScheme();
  const currentColor = Colors[colorScheme ?? 'light'].tint;
  const backgroundColor = Colors[colorScheme ?? 'light'].background;

  function renderTabContainer() {
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
          onPress={() => setSelectedTab('arabic')}
          accessibilityRole="tab"
          accessibilityLabel="العربية"
          accessibilityState={{ selected: selectedTab === 'arabic' }}
          accessibilityHint="اضغط لعرض سياسة الخصوصية بالعربية"
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
          onPress={() => setSelectedTab('english')}
          accessibilityRole="tab"
          accessibilityLabel="English"
          accessibilityState={{ selected: selectedTab === 'english' }}
          accessibilityHint="Press to view the privacy policy in English"
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
  return (
    <ThemedView style={styles.container}>
      <Seo
        title="المصحف المفتوح - سياسة الخصوصية"
        description="سياسة الخصوصية للمصحف المفتوح - معلومات حول كيفية جمع واستخدام وحماية بياناتك"
      />
      {/* Tab Selection */}
      {renderTabContainer()}

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {selectedTab === 'arabic' ? (
          <PrivacyContentArabic />
        ) : (
          <PrivacyContentEnglish />
        )}
      </ScrollView>

      <TouchableOpacity
        style={styles.link}
        onPress={() => console.log('Privacy policy link clicked')}
        accessibilityRole="link"
        accessibilityLabel="عرض تفاصيل سياسة الخصوصية"
        accessibilityHint="ينقلك إلى صفحة تحتوي على تفاصيل سياسة الخصوصية كاملة"
      >
        <ThemedText style={styles.linkText}>
          سياسة الخصوصية - عرض التفاصيل
        </ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}
