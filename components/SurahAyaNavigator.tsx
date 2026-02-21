import React, { useState } from 'react';
import { FlatList, Modal, StyleSheet, TouchableOpacity } from 'react-native';

import { Feather } from '@expo/vector-icons';

import useQuranMetadata from '@/hooks/useQuranMetadata';
import { Surah } from '@/types';
import { isWeb } from '@/utils';

import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

interface SurahAyaNavigatorProps {
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
  currentSurah,
  currentAya,
  ayaCount,
  onSurahChange,
  onAyaChange,
  primaryColor,
  iconColor,
  cardColor,
}: SurahAyaNavigatorProps) {
  const { surahData, isLoading, error } = useQuranMetadata();
  const [surahModalVisible, setSurahModalVisible] = useState(false);
  const [ayaModalVisible, setAyaModalVisible] = useState(false);

  const currentSurahName =
    surahData.find((s) => s.number === currentSurah)?.name || '';

  const handleSurahSelect = (surahNumber: number) => {
    onSurahChange(surahNumber);
    setSurahModalVisible(false);
  };

  const handleAyaSelect = (ayaNumber: number) => {
    onAyaChange(ayaNumber);
    setAyaModalVisible(false);
  };

  if (isLoading) {
    return (
      <ThemedView
        style={[styles.container, { backgroundColor: 'transparent' }]}
      >
        <ThemedText accessible={true} accessibilityRole="alert">
          جاري التحميل...
        </ThemedText>
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView
        style={[styles.container, { backgroundColor: 'transparent' }]}
      >
        <ThemedText
          accessible={true}
          accessibilityRole="alert"
        >{`حدث خطأ: ${error}`}</ThemedText>
      </ThemedView>
    );
  }

  const renderSurahItem = ({ item }: { item: Surah }) => (
    <TouchableOpacity
      style={[
        styles.modalItem,
        item.number === currentSurah && {
          backgroundColor: primaryColor + '20',
        },
      ]}
      onPress={() => handleSurahSelect(item.number)}
      // تحسين الوصول للسور
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={`سورة ${item.name}`}
      accessibilityHint={`عدد آياتها ${item.numberOfAyahs} آية، اضغط للانتقال إليها`}
      accessibilityState={{ selected: item.number === currentSurah }}
    >
      <ThemedText style={styles.surahNumber}>{item.number}</ThemedText>
      <ThemedView style={styles.separatorLine} />
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
      // تحسين الوصول للآيات
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={`آية رقم ${item}`}
      accessibilityState={{ selected: item === currentAya }}
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
          accessible={true}
          accessibilityRole="combobox"
          accessibilityLabel={`السورة الحالية: ${currentSurahName}`}
          accessibilityHint="اضغط لفتح قائمة اختيار السور"
        >
          <ThemedText style={[styles.selectorText, { color: primaryColor }]}>
            {currentSurahName}
          </ThemedText>
          <Feather name="chevron-down" size={18} color={primaryColor} />
        </TouchableOpacity>
      </ThemedView>

      <ThemedView style={styles.verticalDivider} />

      {/* Aya Selector */}
      <ThemedView
        style={[styles.selectorContainer, { backgroundColor: 'transparent' }]}
      >
        <TouchableOpacity
          style={[styles.selector, { borderColor: primaryColor }]}
          onPress={() => setAyaModalVisible(true)}
          accessible={true}
          accessibilityRole="combobox"
          accessibilityLabel={`الآية الحالية: ${currentAya}`}
          accessibilityHint="اضغط لفتح قائمة اختيار الآيات"
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
          accessibilityLabel="إغلاق القائمة"
        >
          <ThemedView
            style={[styles.modalContent, { backgroundColor: cardColor }]}
            onStartShouldSetResponder={() => true}
          >
            <ThemedView style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>اختر سورة</ThemedText>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setSurahModalVisible(false)}
                accessibilityLabel="إغلاق قائمة السور"
              >
                <Feather name="x" size={24} color={iconColor} />
              </TouchableOpacity>
            </ThemedView>

            <FlatList
              data={surahData}
              renderItem={renderSurahItem}
              keyExtractor={(item) => item.number.toString()}
              showsVerticalScrollIndicator={isWeb}
              initialScrollIndex={currentSurah > 0 ? currentSurah - 1 : 0}
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
          accessibilityLabel="إغلاق القائمة"
        >
          <ThemedView
            style={[styles.modalContent, { backgroundColor: cardColor }]}
            onStartShouldSetResponder={() => true}
          >
            <ThemedView style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>اختر آية</ThemedText>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setAyaModalVisible(false)}
                accessibilityLabel="إغلاق قائمة الآيات"
              >
                <Feather name="x" size={24} color={iconColor} />
              </TouchableOpacity>
            </ThemedView>

            <FlatList
              data={ayaCount}
              renderItem={renderAyaItem}
              keyExtractor={(item) => item.toString()}
              showsVerticalScrollIndicator={isWeb}
              numColumns={5}
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
    fontFamily: 'Amiri_400Regular',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  modalContent: {
    width: '95%',
    maxWidth: 640,
    maxHeight: '80%',
    borderRadius: 12,
    padding: 16,
    elevation: 5,
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
  closeButton: {
    padding: 8,
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
    width: 35,
    fontSize: 16,
    fontFamily: 'Tajawal_700Bold',
  },
  separatorLine: {
    width: 1,
    height: 20,
    backgroundColor: '#ccc',
    marginHorizontal: 10,
  },
  verticalDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#ddd',
    marginHorizontal: 5,
  },
  surahName: {
    flex: 1,
    fontSize: 18,
    fontFamily: 'Amiri_400Regular',
    textAlign: 'right',
  },
  surahInfo: {
    fontSize: 14,
    color: '#666',
    marginLeft: 10,
    fontFamily: 'Tajawal_400Regular',
  },
  ayaGrid: {
    paddingVertical: 8,
    alignItems: 'center',
  },
  ayaItem: {
    width: 50,
    height: 50,
    margin: 5,
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
