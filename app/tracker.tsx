// Import useState, Modal, and Feather
import React, { useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
} from 'react-native';

import { Feather } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import { useAtom } from 'jotai/react';

import SEO from '@/components/seo';
import { ThemedButton } from '@/components/ThemedButton';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useColors } from '@/hooks/useColors';
import useCurrentPage from '@/hooks/useCurrentPage';
import {
  dailyTrackerCompleted,
  dailyTrackerGoal,
  yesterdayPage,
} from '@/jotai/atoms';

export default function TrackerScreen() {
  const { iconColor, cardColor, primaryColor } = useColors();
  const { currentSavedPage: savedPage } = useCurrentPage();

  const [dailyTrackerGoalValue, setdailyTrackerGoalValue] =
    useAtom(dailyTrackerGoal);
  const [dailyTrackerCompletedValue, setdailyTrackerCompletedValue] = useAtom(
    dailyTrackerCompleted,
  );
  const [yesterdayPageValue, setYesterdayPageValue] = useAtom(yesterdayPage);
  // Add state for modal visibility
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);

  const dailyProgress =
    dailyTrackerGoalValue > 0
      ? Math.min(
          100,
          (dailyTrackerCompletedValue.value / 8 / (dailyTrackerGoalValue / 8)) *
            100,
        )
      : 0;

  // Should change by full hizb (8 thumns)
  const incrementDailyGoal = () => setdailyTrackerGoalValue((prev) => prev + 1);
  const decrementDailyGoal = () =>
    setdailyTrackerGoalValue((prev) => Math.max(1, prev - 1));

  // Consolidated reset logic into one function
  const performReset = () => {
    if (typeof savedPage === 'number' && savedPage > 0) {
      setYesterdayPageValue({
        value: savedPage,
        date: new Date().toDateString(),
      });
    }

    setdailyTrackerCompletedValue({
      value: 0,
      date: new Date().toDateString(),
    });
    setConfirmModalVisible(false); // Close modal after reset
  };

  // Removed the old resetAllProgress function that used Alert/confirm

  const getHizbText = (count: number) => {
    const hizbCount = count;

    if (hizbCount === 0) return '0 أحزاب';
    if (hizbCount === 1) return 'حزب واحد';
    if (hizbCount === 2) return 'حزبين';
    if (hizbCount >= 3 && hizbCount <= 10) return `${hizbCount} أحزاب`;
    return `${hizbCount} حزباً`;
  };

  return (
    <>
      <Stack.Screen options={{ title: 'الورد' }} />
      <SEO title="الورد - المصحف المفتوح" description="الورد في تطبيق المصحف" />
      <ThemedView style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
        >
          <ThemedView
            style={[styles.navigationSection, { backgroundColor: cardColor }]}
          >
            <ThemedView
              style={[styles.labelContainer, { backgroundColor: cardColor }]}
            >
              <Feather
                name="book-open"
                size={24}
                color={iconColor}
                style={[styles.icon, { color: primaryColor }]}
              />
              <ThemedText style={styles.label}>الورد اليومي:</ThemedText>
            </ThemedView>

            <ThemedView style={styles.progressContainer}>
              <ThemedView
                style={[
                  styles.progressBar,
                  { width: `${dailyProgress}%`, backgroundColor: primaryColor },
                ]}
              />
              <ThemedText
                style={[
                  styles.progressText,
                  { color: dailyProgress > 50 ? 'white' : 'black' },
                ]}
              >
                {dailyProgress.toFixed(1)}%
              </ThemedText>
            </ThemedView>

            <ThemedText style={styles.infoText}>
              قراءة{' '}
              {Number.isInteger(dailyTrackerCompletedValue.value)
                ? getHizbText(dailyTrackerCompletedValue.value)
                : `${dailyTrackerCompletedValue.value.toFixed(1)} حزباً`}{' '}
              من أصل {getHizbText(dailyTrackerGoalValue)}
            </ThemedText>

            {yesterdayPageValue.value > 0 && (
              <ThemedText style={[styles.infoText, { fontSize: 14 }]}>
                آخر صفحة من الأمس: {yesterdayPageValue.value}
              </ThemedText>
            )}

            <ThemedView style={styles.controlsContainer}>
              <ThemedView style={styles.controlGroup}>
                <ThemedText style={styles.controlLabel}>
                  الهدف اليومي:
                </ThemedText>
                <ThemedView style={styles.controls}>
                  <TouchableOpacity
                    style={styles.controlButton}
                    onPress={decrementDailyGoal}
                  >
                    <Feather name="minus" size={20} color={primaryColor} />
                  </TouchableOpacity>
                  <ThemedText style={styles.controlValue}>
                    {getHizbText(dailyTrackerGoalValue)}
                  </ThemedText>
                  <TouchableOpacity
                    style={styles.controlButton}
                    onPress={incrementDailyGoal}
                  >
                    <Feather name="plus" size={20} color={primaryColor} />
                  </TouchableOpacity>
                </ThemedView>
              </ThemedView>
            </ThemedView>
          </ThemedView>

          <ThemedView
            style={[styles.navigationSection, { backgroundColor: cardColor }]}
          >
            <ThemedView
              style={[styles.labelContainer, { backgroundColor: cardColor }]}
            >
              <Feather
                name="info"
                size={24}
                color={iconColor}
                style={[styles.icon, { color: primaryColor }]}
              />
              <ThemedText style={styles.label}>عن تقسيم القرآن:</ThemedText>
            </ThemedView>

            <ThemedText style={styles.infoText}>
              القرآن الكريم مقسم إلى 60 حزباً لتسهيل القراءة والمراجعة.
            </ThemedText>

            <ThemedText style={[styles.infoText, { color: primaryColor }]}>
              يُحسب الورد الْيَوْمِيُّ من خلال مقارنة الصفحة الحالية (صفحة{' '}
              {typeof savedPage === 'number' ? savedPage : 'غير محددة'}) بآخر
              صفحة قرأتها بالأمس، وتحديد عدد الأحزاب المقروءة.
            </ThemedText>

            <ThemedView style={styles.resetButtonsContainer}>
              <ThemedButton
                variant="primary"
                style={styles.resetButton}
                // Update onPress to show the modal
                onPress={() => setConfirmModalVisible(true)}
              >
                <ThemedView
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: 'transparent',
                    justifyContent: 'center',
                    gap: 10,
                  }}
                >
                  <Feather name="refresh-cw" size={16} />
                  <Text
                    style={{
                      fontFamily: 'Tajawal_400Regular',
                      fontSize: 18,
                    }}
                  >
                    إعادة التعيين
                  </Text>
                </ThemedView>
              </ThemedButton>
            </ThemedView>
          </ThemedView>
        </ScrollView>

        {/* Confirmation Modal */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={confirmModalVisible}
          onRequestClose={() => setConfirmModalVisible(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setConfirmModalVisible(false)} // Close on overlay press
          >
            {/* Prevent modal closing when pressing inside content */}
            <ThemedView
              style={[styles.modalContent, { backgroundColor: cardColor }]}
              onStartShouldSetResponder={() => true}
            >
              <ThemedView style={styles.modalHeader}>
                <ThemedText style={styles.modalTitle}>تأكيد</ThemedText>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setConfirmModalVisible(false)}
                >
                  <Feather name="x" size={24} color={iconColor} />
                </TouchableOpacity>
              </ThemedView>

              <ThemedText style={styles.modalMessage}>
                هل أنت متأكد من رغبتك في إعادة تعيين التقدم؟
              </ThemedText>

              <ThemedView style={styles.modalActions}>
                <ThemedButton
                  variant="outlined-primary"
                  onPress={() => setConfirmModalVisible(false)} // Just close modal
                  style={styles.modalButton}
                >
                  إلغاء
                </ThemedButton>
                <ThemedButton
                  variant="primary"
                  onPress={performReset} // Call the reset logic
                  style={styles.modalButton}
                >
                  تأكيد
                </ThemedButton>
              </ThemedView>
            </ThemedView>
          </TouchableOpacity>
        </Modal>
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    margin: 2,
    alignItems: 'center',
    justifyContent: 'flex-start',
    alignSelf: 'center',
    width: '100%',
    maxWidth: 640,
  },
  scrollView: { width: '100%' },
  scrollContent: { alignItems: 'center', paddingBottom: 40 },
  navigationSection: {
    width: '90%',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 12,
  },
  icon: { marginEnd: 10 },
  label: { fontSize: 18, fontWeight: 'bold' },
  progressContainer: {
    height: 24,
    width: '100%',
    borderRadius: 12,
    backgroundColor: '#E5E7EB',
    overflow: 'hidden',
    justifyContent: 'center',
    marginBottom: 8,
  },
  progressBar: {
    position: 'absolute',
    height: '100%',
    left: 0,
    borderRadius: 12,
  },
  progressText: {
    width: '100%',
    textAlign: 'center',
    fontSize: 12,
    zIndex: 1,
  },
  infoText: { marginTop: 4, fontSize: 16, lineHeight: 24 },
  controlsContainer: {
    marginTop: 12,
    alignItems: 'center',
  },
  controlGroup: { flexDirection: 'row', alignItems: 'center' },
  controlLabel: { marginEnd: 8, fontSize: 16 },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 5,
  },
  controlButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 10,
  },
  controlValue: {
    fontSize: 16,
    fontFamily: 'Tajawal_700Bold',
    minWidth: 60,
    textAlign: 'center',
  },
  resetButtonsContainer: {
    marginTop: 20,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  resetButton: { paddingHorizontal: 16, paddingVertical: 8 }, // This padding controls the space around the icon and text

  // Add Modal Styles (copied from settings.tsx and adjusted slightly)
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
    maxWidth: 400,
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
    borderBottomColor: '#eee', // Consider using a theme color here
    minHeight: 40,
    backgroundColor: 'transparent', // Ensure header background is transparent if content has color
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'Tajawal_700Bold',
    textAlignVertical: 'center',
  },
  closeButton: {
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalMessage: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
    fontFamily: 'Tajawal_400Regular',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    backgroundColor: 'transparent', // Ensure actions background is transparent
  },
  modalButton: {
    width: '40%', // Use percentage for better responsiveness
    maxWidth: 120, // Add maxWidth to prevent buttons getting too large
  },
});
