import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
} from 'react-native';

import PrivacyContentArabic from '@/components/PrivacyContentArabic';
import PrivacyContentEnglish from '@/components/PrivacyContentEnglish';
import { ThemedSafeAreaView } from '@/components/ThemedSafeAreaView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';

export default function PrivacyScreen() {
  const [selectedTab, setSelectedTab] = useState('arabic'); // Default to Arabic
  const colorScheme = useColorScheme();
  const currentColor = Colors[colorScheme ?? 'light'].tint;
  const backgroundColor = Colors[colorScheme ?? 'light'].background;

  return (
    <ThemedSafeAreaView style={styles.container}>
      {/* Tab Selection */}
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
          onPress={() => setSelectedTab('arabic')}
          accessibilityRole="button"
          accessibilityLabel="Switch to Arabic tab"
          accessibilityState={{ selected: selectedTab === 'arabic' }}
          accessibilityHint="Select this tab to view the privacy policy in Arabic."
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
          onPress={() => setSelectedTab('english')}
          accessibilityRole="button"
          accessibilityLabel="Switch to English tab"
          accessibilityState={{ selected: selectedTab === 'english' }}
          accessibilityHint="Select this tab to view the privacy policy in English."
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
    </ThemedSafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
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
    paddingBottom: 40,
  },
  link: {
    marginTop: 20,
    alignItems: 'center',
    height: 48,
    justifyContent: 'center',
  },
  linkText: {
    fontSize: 16,
    color: Colors.light.tint,
    textDecorationLine: 'underline',
  },
});
