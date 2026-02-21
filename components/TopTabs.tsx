import { StyleSheet, TouchableOpacity } from 'react-native';

import { useColors } from '@/hooks/useColors';
import { ListTabs } from '@/types';

import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

type Props = {
  setActiveTab: (tab: ListTabs) => void;
  activeTab: ListTabs;
};

export default function TopTabs({ activeTab, setActiveTab }: Props) {
  const { backgroundColor, textColor } = useColors();

  const handleTabPress = (tab: ListTabs) => {
    setActiveTab(tab);
  };

  return (
    <ThemedView style={styles.container}>
      <TouchableOpacity
        onPress={() => handleTabPress('surahs')}
        // --- تحسينات الوصول ---
        accessible={true}
        accessibilityRole="tab" // نستخدم tab بدلاً من button ليعرف القارئ أنها قائمة تبويبات
        accessibilityLabel="قائمة السور"
        accessibilityState={{ selected: activeTab === 'surahs' }} // يخبر المستخدم "مختار" أو "غير مختار"
        accessibilityHint="يعرض قائمة بجميع سور القرآن الكريم"
        // -----------------------
        style={[
          styles.tab,
          activeTab === 'surahs' && {
            backgroundColor: backgroundColor,
            borderBottomWidth: 2,
            borderBottomColor: textColor,
          },
        ]}
      >
        <ThemedText
          style={[
            styles.tabText,
            activeTab === 'surahs' && styles.activeTabText,
            activeTab === 'surahs' && { color: textColor },
          ]}
        >
          السور
        </ThemedText>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => handleTabPress('juzs')}
        // --- تحسينات الوصول ---
        accessible={true}
        accessibilityRole="tab"
        accessibilityLabel="قائمة الأجزاء"
        accessibilityState={{ selected: activeTab === 'juzs' }}
        accessibilityHint="يعرض قائمة بأجزاء القرآن الكريم الثلاثين"
        // -----------------------
        style={[
          styles.tab,
          activeTab === 'juzs' && {
            backgroundColor: backgroundColor,
            borderBottomWidth: 2,
            borderBottomColor: textColor,
          },
        ]}
      >
        <ThemedText
          style={[
            styles.tabText,
            activeTab === 'juzs' && styles.activeTabText,
            activeTab === 'juzs' && { color: textColor },
          ]}
        >
          الأجزاء
        </ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  // ... (نفس الـ styles السابقة بدون تغيير)
  container: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-around',
    paddingVertical: 10,
  },
  tab: {
    paddingVertical: 12,
    paddingHorizontal: 30,
    width: 200,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 24,
    lineHeight: 32,
    fontFamily: 'Tajawal_700Bold',
    fontWeight: '500',
  },
  activeTabText: {
    fontWeight: '700',
  },
});
