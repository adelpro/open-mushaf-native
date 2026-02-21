import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';

import PrivacyContentArabic from '@/components/PrivacyContentArabic';
import PrivacyContentEnglish from '@/components/PrivacyContentEnglish';
import SEO from '@/components/seo';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { isRTL } from '@/utils';

export default function PrivacyScreen() {
  const [selectedTab, setSelectedTab] = useState<'arabic' | 'english'>(
    'arabic',
  );
  const colorScheme = useColorScheme();
  const theme = colorScheme ?? 'light';

  const currentColor = Colors[theme].tint;
  const backgroundColor = Colors[theme].background;

  return (
    <ThemedView style={styles.container}>
      <SEO
        title="المصحف المفتوح - سياسة الخصوصية"
        description="سياسة الخصوصية للمصحف المفتوح - معلومات حول كيفية جمع واستخدام وحماية بياناتك"
      />

      {/* اختيار اللغة (Tabs) */}
      <View
        style={styles.tabContainer}
        accessible={true}
        accessibilityRole="tablist" // تعريف القائمة كقائمة تبويبات
      >
        <TouchableOpacity
          style={[
            styles.tab,
            selectedTab === 'arabic' && {
              backgroundColor,
              borderBottomWidth: 3, // زيادة السمك قليلاً للوضوح البصري
              borderBottomColor: currentColor,
            },
          ]}
          onPress={() => setSelectedTab('arabic')}
          accessible={true}
          accessibilityRole="tab"
          accessibilityLabel="عرض السياسة باللغة العربية"
          accessibilityState={{ selected: selectedTab === 'arabic' }}
        >
          <ThemedText
            style={[
              styles.tabText,
              selectedTab === 'arabic' && {
                color: currentColor,
                fontWeight: 'bold',
              },
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
              borderBottomWidth: 3,
              borderBottomColor: currentColor,
            },
          ]}
          onPress={() => setSelectedTab('english')}
          accessible={true}
          accessibilityRole="tab"
          accessibilityLabel="View policy in English"
          accessibilityState={{ selected: selectedTab === 'english' }}
        >
          <ThemedText
            style={[
              styles.tabText,
              selectedTab === 'english' && {
                color: currentColor,
                fontWeight: 'bold',
              },
            ]}
          >
            English
          </ThemedText>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        accessible={true}
        // هذا التنبيه يخبر المستخدم أن المحتوى يتغير بناءً على التبويب المختار
        accessibilityLabel={
          selectedTab === 'arabic'
            ? 'محتوى سياسة الخصوصية بالعربية'
            : 'Privacy Policy Content in English'
        }
      >
        {selectedTab === 'arabic' ? (
          <PrivacyContentArabic />
        ) : (
          <PrivacyContentEnglish />
        )}
      </ScrollView>

      {/* الرابط السفلي */}
      <TouchableOpacity
        style={styles.link}
        onPress={() => console.log('Privacy policy link clicked')}
        accessible={true}
        accessibilityRole="link"
        accessibilityLabel="زيارة موقع سياسة الخصوصية"
        accessibilityHint="يفتح المتصفح لعرض تفاصيل إضافية"
      >
        <ThemedText style={[styles.linkText, { color: currentColor }]}>
          سياسة الخصوصية - عرض التفاصيل الكاملة
        </ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 0, // أزلنا الـ padding من هنا لنعطي مساحة للـ Tabs
  },
  tabContainer: {
    flexDirection: isRTL ? 'row' : 'row-reverse',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(0,0,0,0.02)', // تمييز بسيط لمنطقة التبويبات
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabText: {
    fontSize: 16,
    fontFamily: 'Tajawal_500Medium',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 60,
  },
  link: {
    padding: 15,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    marginBottom: 10,
  },
  linkText: {
    fontSize: 15,
    textDecorationLine: 'underline',
    fontFamily: 'Tajawal_500Medium',
  },
});
