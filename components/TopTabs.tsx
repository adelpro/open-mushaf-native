import { TouchableOpacity } from 'react-native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useColors, useOrientation } from '@/hooks';
import { ListTabs } from '@/types';

import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { styles } from './TopTabs.styles';

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
  const { top, left, right } = useSafeAreaInsets();
  const { isLandscape } = useOrientation();

  const handleTabPress = (tab: ListTabs) => {
    setActiveTab(tab);
  };

  function renderTab() {
    return (
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
    );
  }

  function renderTab2() {
    return (
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
    );
  }
  return (
    <ThemedView
      style={[
        styles.container,
        {
          paddingTop: isLandscape ? 0 : top,
          paddingLeft: left,
          paddingRight: right,
        },
      ]}
    >
      {renderTab()}

      {renderTab2()}
    </ThemedView>
  );
}
