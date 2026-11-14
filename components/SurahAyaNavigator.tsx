import { useState } from 'react';
import { FlatList, Modal, TouchableOpacity } from 'react-native';

import { Feather } from '@expo/vector-icons';

import { useQuranMetadata } from '@/hooks';
import { Surah } from '@/types';
import { isWeb } from '@/utils';

import { styles } from './SurahAyaNavigator.styles';
import { SurahListItem } from './SurahListItem';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

/**
 * Configuration schema for the Surah / Aya dual-navigator block.
 */
interface SurahAyaNavigatorProps {
  /** Active numeric surah index (e.g., 1 for Al-Fatihah). */
  currentSurah: number;
  /** Active numeric aya index representing progression within the `currentSurah`. */
  currentAya: number;
  /** Complete list representation mapping out the number of verses available. */
  ayaCount: number[];
  /** Handler fired when the user selects a new Surah via the modal. */
  onSurahChange: (surahNumber: number) => void;
  /** Handler fired when the user targets a specific Aya jump. */
  onAyaChange: (ayaNumber: number) => void;
  primaryColor: string;
  iconColor: string;
  cardColor: string;
}
/**
 * A composite navigation component exposing dropdown-styled elements.
 * Invokes modal layovers containing FlatLists that let the user precisely scroll and tap-navigate
 * to granular coordinates (Surah + Aya level) efficiently.
 *
 * @param props - Mapped variables determining active Surahs and controlling selection triggers.
 * @returns Fully styled dual toggle `<View>` and associated Modals.
 */
export function SurahAyaNavigator(props: SurahAyaNavigatorProps) {
  const {
    currentSurah,
    currentAya,
    ayaCount,
    onSurahChange,
    onAyaChange,
    primaryColor,
    iconColor,
    cardColor,
  } = props;

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

  // Show loading or error state if needed
  function renderLoading() {
    return (
      <ThemedView
        style={[styles.container, { backgroundColor: 'transparent' }]}
      >
        <ThemedText>جاري التحميل...</ThemedText>
      </ThemedView>
    );
  }
  if (isLoading) return renderLoading();

  function renderLoadError() {
    return (
      <ThemedView
        style={[styles.container, { backgroundColor: 'transparent' }]}
      >
        <ThemedText>{error}</ThemedText>
      </ThemedView>
    );
  }
  if (error) return renderLoadError();

  const renderSurahItem = ({ item }: { item: Surah }) => (
    <SurahListItem
      item={item}
      selected={item.number === currentSurah}
      primaryColor={primaryColor}
      onSelect={handleSurahSelect}
    />
  );

  const renderAyaItem = ({ item }: { item: number }) => {
    return (
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
  };

  function renderModal() {
    function renderModalOverlay() {
      function renderModalContent() {
        return (
          <ThemedView
            style={[styles.modalContent, { backgroundColor: cardColor }]}
            onStartShouldSetResponder={() => true}
          >
            <ThemedView style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>اختر سورة</ThemedText>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setSurahModalVisible(false)}
                accessibilityRole="button"
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
              initialScrollIndex={Math.max(0, currentSurah - 1)}
              getItemLayout={(...[, index]) => ({
                length: 60,
                offset: 60 * index,
                index,
              })}
            />
          </ThemedView>
        );
      }
      return (
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setSurahModalVisible(false)}
          accessibilityLabel="إغلاق قائمة السور"
          accessibilityRole="button"
        >
          {renderModalContent()}
        </TouchableOpacity>
      );
    }
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={surahModalVisible}
        onRequestClose={() => setSurahModalVisible(false)}
      >
        {renderModalOverlay()}
      </Modal>
    );
  }

  function renderModal2() {
    function renderModalOverlay2() {
      function renderModalContent2() {
        function renderFlatList() {
          return (
            <FlatList
              data={ayaCount}
              renderItem={renderAyaItem}
              keyExtractor={(item) => item.toString()}
              showsVerticalScrollIndicator={isWeb}
              numColumns={5}
              initialScrollIndex={Math.max(0, Math.floor((currentAya - 1) / 5))}
              getItemLayout={(...[, index]) => ({
                length: 50,
                offset: 50 * Math.floor(index / 5),
                index,
              })}
              contentContainerStyle={styles.ayaGrid}
            />
          );
        }
        return (
          <ThemedView
            style={[styles.modalContent, { backgroundColor: cardColor }]}
            onStartShouldSetResponder={() => true}
          >
            <ThemedView style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>اختر آية</ThemedText>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setAyaModalVisible(false)}
                accessibilityRole="button"
                accessibilityLabel="إغلاق قائمة الآيات"
              >
                <Feather name="x" size={24} color={iconColor} />
              </TouchableOpacity>
            </ThemedView>

            {renderFlatList()}
          </ThemedView>
        );
      }
      return (
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setAyaModalVisible(false)}
          accessibilityLabel="إغلاق قائمة الآيات"
          accessibilityRole="button"
        >
          {renderModalContent2()}
        </TouchableOpacity>
      );
    }
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={ayaModalVisible}
        onRequestClose={() => setAyaModalVisible(false)}
      >
        {renderModalOverlay2()}
      </Modal>
    );
  }

  function renderSelectorContainer() {
    return (
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
    );
  }

  function renderSelectorContainer2() {
    return (
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
    );
  }
  function renderSelectorSeparator() {
    return (
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
    );
  }
  return (
    <ThemedView style={[styles.container, { backgroundColor: 'transparent' }]}>
      {/* Surah Selector */}
      {renderSelectorContainer()}
      {renderSelectorSeparator()}
      {/* Aya Selector */}
      {renderSelectorContainer2()}

      {/* Surah Modal */}
      {renderModal()}

      {/* Aya Modal */}
      {renderModal2()}
    </ThemedView>
  );
}
