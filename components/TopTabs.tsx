import React from 'react';
import { StyleSheet, TouchableOpacity, useColorScheme } from 'react-native';

import { Colors } from '@/constants/Colors'; // Ensure this import is correct
import { ListTabs } from '@/types';

import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

type Props = {
  setActiveTab: (tab: ListTabs) => void;
  activeTab: ListTabs;
};

export default function TopTabs({ activeTab, setActiveTab }: Props) {
  const colorScheme = useColorScheme();
  const currentColor = Colors[colorScheme ?? 'light'].tint;
  const backgroundColor = Colors[colorScheme ?? 'light'].background; // Background color for active tab

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
            borderBottomColor: currentColor,
          },
        ]}
      >
        <ThemedText
          style={[
            styles.tabText,
            activeTab === 'surahs' && styles.activeTabText,
            activeTab === 'surahs' && { color: currentColor },
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
            borderBottomColor: currentColor,
          },
        ]}
      >
        <ThemedText
          style={[
            styles.tabText,
            activeTab === 'juzs' && styles.activeTabText,
            activeTab === 'juzs' && { color: currentColor },
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
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
  },
  tab: {
    paddingVertical: 12,
    paddingHorizontal: 30,
    width: 200,
    alignItems: 'center', // Center align text within the tab
  },
  tabText: {
    fontSize: 24,
    lineHeight: 32,
    //color: '#6b7280', // Gray for inactive tabs
    fontWeight: '500',
  },
  activeTabText: {
    //color: '#1f2937', // Darker text for the active tab
    fontWeight: '700',
  },
});
