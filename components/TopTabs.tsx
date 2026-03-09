import { StyleSheet, TouchableOpacity } from 'react-native';

import { useColors } from '@/hooks';
import { ListTabs } from '@/types';

import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

/**
 * Navigation state hooks mapping to available tabs.
 */
type Props = {
  /** Setter modifying the global view context. */
  setActiveTab: (tab: ListTabs) => void;
  /** Active selected key. */
  activeTab: ListTabs;
};

/**
 * Simple horizontal row of tab controls used exclusively for swapping
 * between `Surah` and `Juz` listings on the main `Navigation` screen.
 *
 * @param props - Mapped state bindings.
 * @returns A `<View>` displaying 2 labeled tabs triggering state changes on press.
 */
export function TopTabs({ activeTab, setActiveTab }: Props) {
  const { backgroundColor, textColor } = useColors();

  const handleTabPress = (tab: ListTabs) => {
    setActiveTab(tab);
  };

  return (
    <ThemedView style={styles.container}>
      <TouchableOpacity
        onPress={() => handleTabPress('surahs')}
        style={[
          styles.tab,
          activeTab === 'surahs' && {
            backgroundColor: backgroundColor,
            borderBottomWidth: 2,
            borderBottomColor: textColor,
          },
        ]}
        accessibilityLabel="السور"
        accessibilityHint="اضغط لعرض قائمة السور"
        accessibilityRole="tab"
        accessibilityState={{ selected: activeTab === 'surahs' }}
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
        style={[
          styles.tab,
          activeTab === 'juzs' && {
            backgroundColor: backgroundColor,
            borderBottomWidth: 2,
            borderBottomColor: textColor,
          },
        ]}
        accessibilityLabel="الأجزاء"
        accessibilityHint="اضغط لعرض قائمة الأجزاء"
        accessibilityRole="tab"
        accessibilityState={{ selected: activeTab === 'juzs' }}
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
    fontFamily: 'Tajawal_500Medium',
  },
  activeTabText: {
    fontFamily: 'Tajawal_700Bold',
  },
});
