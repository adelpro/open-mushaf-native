// Import useState, Modal, and Feather
import React, { useMemo, useState } from 'react';
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

import {
  ReadingChart,
  Seo,
  ThemedButton,
  ThemedText,
  ThemedView,
} from '@/components';
import { useColors, useCurrentPage, useUpdateAndroidWidget } from '@/hooks';
import {
  dailyTrackerCompleted,
  dailyTrackerGoal,
  yesterdayPage,
} from '@/jotai/atoms';
import { createModalStyles } from '@/styles/modalStyles';

export default function TrackerScreen() {
  const {
    iconColor,
    cardColor,
    primaryColor,
    borderLightColor,
    overlayColor,
    textColor,
  } = useColors();
  const { currentSavedPage: savedPage } = useCurrentPage();

  const { updateAndroidWidget } = useUpdateAndroidWidget();

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
  const performReset = async () => {
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
    // Update Android widget
    await updateAndroidWidget();
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

  const modalStyles = useMemo(
    () => createModalStyles({ overlayColor, borderLightColor }),
    [overlayColor, borderLightColor],
  );

  const styles = useMemo(
    () => createStyles({ borderLightColor }),
    [borderLightColor],
  );

  return (
    <>
      <Stack.Screen options={{ title: 'الورد' }} />
      <Seo title="الورد - المصحف المفتوح" description="الورد في تطبيق المصحف" />
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
                  { color: dailyProgress > 50 ? 'white' : textColor },
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
                    accessibilityLabel="تقليل الهدف اليومي"
                    accessibilityHint="اضغط لتقليل عدد الأحزاب في الهدف اليومي"
                    accessibilityRole="button"
                  >
                    <Feather name="minus" size={20} color={primaryColor} />
                  </TouchableOpacity>
                  <ThemedText style={styles.controlValue}>
                    {getHizbText(dailyTrackerGoalValue)}
                  </ThemedText>
                  <TouchableOpacity
                    style={styles.controlButton}
                    onPress={incrementDailyGoal}
                    accessibilityLabel="زيادة الهدف اليومي"
                    accessibilityHint="اضغط لزيادة عدد الأحزاب في الهدف اليومي"
                    accessibilityRole="button"
                  >
                    <Feather name="plus" size={20} color={primaryColor} />
                  </TouchableOpacity>
                </ThemedView>
              </ThemedView>
            </ThemedView>
          </ThemedView>

          <ReadingChart />

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
                onPress={() => setConfirmModalVisible(true)}
              >
                <ThemedView style={styles.resetButtonContent}>
                  <Feather name="refresh-cw" size={16} />
                  <Text style={styles.resetButtonText}>إعادة التعيين</Text>
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
            style={modalStyles.modalOverlay}
            activeOpacity={1}
            onPress={() => setConfirmModalVisible(false)}
            accessibilityLabel="إغلاق نافذة التأكيد"
            accessibilityRole="button"
          >
            <ThemedView
              style={[
                modalStyles.modalContent,
                { backgroundColor: cardColor },
              ]}
              onStartShouldSetResponder={() => true}
            >
              <ThemedView style={modalStyles.modalHeader}>
                <ThemedText style={modalStyles.modalTitle}>تأكيد</ThemedText>
                <TouchableOpacity
                  style={modalStyles.closeButton}
                  onPress={() => setConfirmModalVisible(false)}
                  accessibilityRole="button"
                  accessibilityLabel="إغلاق نافذة التأكيد"
                >
                  <Feather name="x" size={24} color={iconColor} />
                </TouchableOpacity>
              </ThemedView>

              <ThemedText style={modalStyles.modalMessage}>
                هل أنت متأكد من رغبتك في إعادة تعيين التقدم؟
              </ThemedText>

              <ThemedView style={modalStyles.modalActions}>
                <ThemedButton
                  variant="outlined-primary"
                  onPress={() => setConfirmModalVisible(false)}
                  style={modalStyles.modalButton}
                >
                  إلغاء
                </ThemedButton>
                <ThemedButton
                  variant="primary"
                  onPress={() => performReset()}
                  style={modalStyles.modalButton}
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

const createStyles = (colors: { borderLightColor: string }) =>
  StyleSheet.create({
  container: {
    flex: 1,
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
    backgroundColor: colors.borderLightColor,
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
    borderColor: colors.borderLightColor,
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
  resetButton: { paddingHorizontal: 16, paddingVertical: 8 },
  resetButtonContent: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'transparent',
      justifyContent: 'center',
      gap: 10,
    },
    resetButtonText: {
      fontFamily: 'Tajawal_400Regular',
      fontSize: 18,
    },
  });
