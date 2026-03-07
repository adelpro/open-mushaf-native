import { useState } from 'react';
import { Platform, ScrollView, StyleSheet } from 'react-native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ChapterList, Seo, SurahList, ThemedView, TopTabs } from '@/components';
import { ListTabs } from '@/types';

export default function ListsScreen() {
  const [activeTab, setActiveTab] = useState<ListTabs>('surahs');
  const insets = useSafeAreaInsets();

  return (
    <ThemedView
      style={[
        styles.container,
        { paddingTop: Platform.OS === 'ios' ? insets.top : 0 },
      ]}
    >
      <Seo
        title="القوائم"
        description="قائمة السور والأجزاء - المصحف المفتوح"
      />
      <TopTabs activeTab={activeTab} setActiveTab={setActiveTab} />
      <ScrollView>
        {activeTab === 'juzs' && <ChapterList />}
        {activeTab === 'surahs' && <SurahList />}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
