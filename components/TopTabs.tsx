import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';

import { Tabs } from '@/types/tabs';

import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

type Props = {
  setActiveTab: (tab: Tabs) => void;
  activeTab: Tabs;
};

export default function TopTabs({ activeTab, setActiveTab }: Props) {
  const handleTabPress = (tab: Tabs) => {
    setActiveTab(tab);
  };

  return (
    <ThemedView style={styles.container}>
      <TouchableOpacity
        onPress={() => handleTabPress('surahs')}
        style={[styles.tab, activeTab === 'surahs' && styles.activeTab]}
      >
        <ThemedText
          style={[
            styles.tabText,
            activeTab === 'surahs' && styles.activeTabText,
          ]}
        >
          السور
        </ThemedText>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => handleTabPress('juzs')}
        style={[styles.tab, activeTab === 'juzs' && styles.activeTab]}
      >
        <ThemedText
          style={[styles.tabText, activeTab === 'juzs' && styles.activeTabText]}
        >
          الأجزاء
        </ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
  },
  tab: {
    paddingVertical: 12,
    paddingHorizontal: 30, // Wider tabs for better spacing
    marginHorizontal: 10,
  },
  tabText: {
    fontSize: 24,
    color: '#6b7280', // Gray for inactive tabs
    fontWeight: '500',
  },
  activeTab: {
    borderBottomWidth: 3, // Bottom-only border
    borderBottomColor: '#1f2937', // Darker border for the active tab
  },
  activeTabText: {
    color: '#1f2937', // Darker text for the active tab
    fontWeight: '700',
  },
});
