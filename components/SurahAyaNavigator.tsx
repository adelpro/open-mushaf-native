import React, { useState } from 'react';
import { FlatList, Modal, StyleSheet, TouchableOpacity } from 'react-native';

import { Feather } from '@expo/vector-icons';

import { Surah } from '@/types';

import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

interface SurahAyaNavigatorProps {
  surahs: Surah[];
  currentSurah: number;
  currentAya: number;
  ayaCount: number[];
  onSurahChange: (surahNumber: number) => void;
  onAyaChange: (ayaNumber: number) => void;
  primaryColor: string;
  iconColor: string;
  cardColor: string;
}
export default function SurahAyaNavigator({
  surahs,
  currentSurah,
  currentAya,
  ayaCount,
  onSurahChange,
  onAyaChange,
  primaryColor,
  iconColor,
  cardColor,
}: SurahAyaNavigatorProps) {
  const [surahModalVisible, setSurahModalVisible] = useState(false);
  const [ayaModalVisible, setAyaModalVisible] = useState(false);

  const currentSurahName =
    surahs.find((s) => s.number === currentSurah)?.name || '';

  const handleSurahSelect = (surahNumber: number) => {
    onSurahChange(surahNumber);
    setSurahModalVisible(false);
  };

  const handleAyaSelect = (ayaNumber: number) => {
    onAyaChange(ayaNumber);
    setAyaModalVisible(false);
  };

  const renderSurahItem = ({ item }: { item: Surah }) => (
    <TouchableOpacity
      style={[
        styles.modalItem,
        item.number === currentSurah && {
          backgroundColor: primaryColor + '20',
        },
      ]}
      onPress={() => handleSurahSelect(item.number)}
      accessibilityLabel={`سورة ${item.name}`}
    >
      <ThemedText style={styles.surahNumber}>{item.number}</ThemedText>
      <ThemedView
        style={[
          styles.separator,
          {
            backgroundColor: 'transparent',
            borderColor: primaryColor + '40',
            borderLeftWidth: 1,
            borderRightWidth: 1,
            borderStyle: 'dotted',
          },
        ]}
      />
      <ThemedText style={styles.surahName}>{item.name}</ThemedText>
      <ThemedText style={styles.surahInfo}>{item.numberOfAyahs} آية</ThemedText>
    </TouchableOpacity>
  );

  const renderAyaItem = ({ item }: { item: number }) => (
    <TouchableOpacity
      style={[
        styles.ayaItem,
        item === currentAya && { backgroundColor: primaryColor + '20' },
      ]}
      onPress={() => handleAyaSelect(item)}
      accessibilityLabel={`آية ${item}`}
    >
      <ThemedText style={styles.ayaNumber}>{item}</ThemedText>
    </TouchableOpacity>
  );

  return (
    <ThemedView style={[styles.container, { backgroundColor: 'transparent' }]}>
      {/* Surah Selector */}
      <ThemedView
        style={[styles.selectorContainer, { backgroundColor: 'transparent' }]}
      >
        <TouchableOpacity
          style={[styles.selector, { borderColor: primaryColor }]}
          onPress={() => setSurahModalVisible(true)}
          accessibilityLabel="اختر سورة"
          accessibilityHint="اضغط لفتح قائمة السور"
        >
          <ThemedText style={[styles.selectorText, { color: primaryColor }]}>
            {currentSurahName}
          </ThemedText>
          <Feather name="chevron-down" size={18} color={primaryColor} />
        </TouchableOpacity>
      </ThemedView>
      <ThemedView
        style={[
          styles.separator,
          {
            backgroundColor: 'transparent',
            borderColor: primaryColor + '40',
            borderLeftWidth: 1,
            borderRightWidth: 1,
            borderStyle: 'dotted',
          },
        ]}
      />
      {/* Aya Selector */}
      <ThemedView
        style={[styles.selectorContainer, { backgroundColor: 'transparent' }]}
      >
        <TouchableOpacity
          style={[styles.selector, { borderColor: primaryColor }]}
          onPress={() => setAyaModalVisible(true)}
          accessibilityLabel="اختر آية"
          accessibilityHint="اضغط لفتح قائمة الآيات"
        >
          <ThemedText style={[styles.selectorText, { color: primaryColor }]}>
            {currentAya}
          </ThemedText>
          <Feather name="chevron-down" size={18} color={primaryColor} />
        </TouchableOpacity>
      </ThemedView>

      {/* Surah Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={surahModalVisible}
        onRequestClose={() => setSurahModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setSurahModalVisible(false)}
        >
          <ThemedView
            style={[styles.modalContent, { backgroundColor: cardColor }]}
            onStartShouldSetResponder={() => true}
          >
            <ThemedView style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>اختر سورة</ThemedText>
              <TouchableOpacity onPress={() => setSurahModalVisible(false)}>
                <Feather name="x" size={24} color={iconColor} />
              </TouchableOpacity>
            </ThemedView>

            <FlatList
              data={surahs}
              renderItem={renderSurahItem}
              keyExtractor={(item) => item.number.toString()}
              showsVerticalScrollIndicator={false}
              initialScrollIndex={currentSurah - 1}
              getItemLayout={(_data, index) => ({
                length: 60,
                offset: 60 * index,
                index,
              })}
            />
          </ThemedView>
        </TouchableOpacity>
      </Modal>

      {/* Aya Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={ayaModalVisible}
        onRequestClose={() => setAyaModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setAyaModalVisible(false)}
        >
          <ThemedView
            style={[styles.modalContent, { backgroundColor: cardColor }]}
            onStartShouldSetResponder={() => true}
          >
            <ThemedView style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>اختر آية</ThemedText>
              <TouchableOpacity onPress={() => setAyaModalVisible(false)}>
                <Feather name="x" size={24} color={iconColor} />
              </TouchableOpacity>
            </ThemedView>

            <FlatList
              data={ayaCount}
              renderItem={renderAyaItem}
              keyExtractor={(item) => item.toString()}
              showsVerticalScrollIndicator={false}
              numColumns={5}
              initialScrollIndex={Math.floor((currentAya - 1) / 5)}
              getItemLayout={(data, index) => ({
                length: 50,
                offset: 50 * Math.floor(index / 5),
                index,
              })}
              contentContainerStyle={styles.ayaGrid}
            />
          </ThemedView>
        </TouchableOpacity>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: 640,
    paddingVertical: 10,
    alignSelf: 'center',
  },
  selectorContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 5,
  },
  selector: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  selectorText: {
    fontSize: 16,
    fontFamily: 'Tajawal_500Medium',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 5,
    paddingVertical: 20,
  },
  modalContent: {
    width: '90%',
    maxWidth: 640,
    maxHeight: '80%',
    borderRadius: 12,
    padding: 16,
    elevation: 5,
    alignSelf: 'center',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'Tajawal_700Bold',
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  surahNumber: {
    width: 30,
    fontSize: 16,
    fontFamily: 'Tajawal_700Bold',
  },
  separator: {
    width: 2,
    height: '70%',
    marginHorizontal: 12,
    borderRadius: 4,
    overflow: 'hidden',
    // Islamic-inspired decorative separator
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderStyle: 'dotted',
    opacity: 0.8,
    backgroundColor: 'transparent',
  },
  surahName: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Amiri_400Regular',
    marginLeft: 5,
  },
  surahInfo: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'Tajawal_400Regular',
  },
  ayaGrid: {
    paddingVertical: 8,
  },
  ayaItem: {
    width: '18%',
    aspectRatio: 1,
    margin: '1%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
  },
  ayaNumber: {
    fontSize: 16,
    fontFamily: 'Tajawal_500Medium',
  },
});
