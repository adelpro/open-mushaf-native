// Import useState, Modal, and Feather
import { useState } from 'react';
import { Modal, ScrollView, TouchableOpacity } from 'react-native';

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
import { styles } from '@/styles/screens/tracker.styles';

export default function TrackerScreen() {
  const { iconColor, cardColor, primaryColor, textColor, ivoryColor } =
    useColors();
  const { currentSavedPage: savedPage } = useCurrentPage();

  const { updateAndroidWidget } = useUpdateAndroidWidget();

  const [dailyTrackerGoalValue, setDailyTrackerGoalValue] =
    useAtom(dailyTrackerGoal);
  const [dailyTrackerCompletedValue, setDailyTrackerCompletedValue] = useAtom(
    dailyTrackerCompleted,
  );
  const [yesterdayPageValue, setYesterdayPageValue] = useAtom(yesterdayPage);
  // Add state for modal visibility
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);

  // Both `dailyTrackerCompletedValue.value` and `dailyTrackerGoalValue` are
  // expressed in hizbs (1-indexed: 1..60), so a straight ratio is correct.
  // Hizbs are 1-indexed and there are 8 thumns per hizb — the stepper changes
  // the goal by 1 full hizb at a time.
  const dailyProgress =
    dailyTrackerGoalValue > 0
      ? Math.min(
          100,
          (dailyTrackerCompletedValue.value / dailyTrackerGoalValue) * 100,
        )
      : 0;

  const incrementDailyGoal = () => setDailyTrackerGoalValue((prev) => prev + 1);
  const decrementDailyGoal = () =>
    setDailyTrackerGoalValue((prev) => Math.max(1, prev - 1));

  // Consolidated reset logic into one function
  const performReset = async () => {
    if (typeof savedPage === 'number' && savedPage > 0) {
      setYesterdayPageValue({
        value: savedPage,
        date: new Date().toDateString(),
      });
    }

    setDailyTrackerCompletedValue({
      value: 0,
      date: new Date().toDateString(),
    });
    // Update Android widget
    await updateAndroidWidget();
    setConfirmModalVisible(false); // Close modal after reset
  };

  // Removed the old resetAllProgress function that used Alert/confirm

  // Pluralizes a hizb count for Arabic. Integers go through the full
  // singular/dual/plural rules; fractional values (e.g. 0.5, 1.25 — produced
  // by `thumnsCompleted / 8`) are rendered with a single decimal and the
  // bare singular, e.g. "1.5 حزب" rather than the awkward "1.5 حزباً".
  const getHizbText = (count: number) => {
    if (!Number.isInteger(count)) {
      return `${count.toFixed(1)} حزب`;
    }
    if (count === 0) return '0 أحزاب';
    if (count === 1) return 'حزب واحد';
    if (count === 2) return 'حزبين';
    if (count >= 3 && count <= 10) return `${count} أحزاب`;
    return `${count} حزباً`;
  };

  function renderProgressContainer() {
    return (
      <ThemedView
        style={[styles.progressContainer, { backgroundColor: ivoryColor }]}
      >
        <ThemedView
          style={[
            styles.progressBar,
            { width: `${dailyProgress}%`, backgroundColor: primaryColor },
          ]}
        />
        <ThemedText
          style={[
            styles.progressText,
            // When the bar fills past the centered label, the label sits
            // on the (always dark) primary fill — white reads well in both
            // themes. Otherwise the label sits on the theme-aware track,
            // so we use the theme's text color for contrast.
            { color: dailyProgress > 50 ? '#fff' : textColor },
          ]}
        >
          {dailyProgress.toFixed(1)}%
        </ThemedText>
      </ThemedView>
    );
  }

  function renderControlsContainer() {
    function renderControlGroup() {
      function renderControls() {
        return (
          <ThemedView style={styles.controls}>
            <TouchableOpacity
              style={[styles.controlButton, { borderColor: ivoryColor }]}
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
              style={[styles.controlButton, { borderColor: ivoryColor }]}
              onPress={incrementDailyGoal}
              accessibilityLabel="زيادة الهدف اليومي"
              accessibilityHint="اضغط لزيادة عدد الأحزاب في الهدف اليومي"
              accessibilityRole="button"
            >
              <Feather name="plus" size={20} color={primaryColor} />
            </TouchableOpacity>
          </ThemedView>
        );
      }
      return (
        <ThemedView style={styles.controlGroup}>
          <ThemedText style={styles.controlLabel}>الهدف اليومي:</ThemedText>
          {renderControls()}
        </ThemedView>
      );
    }
    return (
      <ThemedView style={styles.controlsContainer}>
        {renderControlGroup()}
      </ThemedView>
    );
  }

  function renderNavigationSection() {
    return (
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

        {renderProgressContainer()}

        <ThemedText style={styles.infoText}>
          قراءة {getHizbText(dailyTrackerCompletedValue.value)} من أصل{' '}
          {getHizbText(dailyTrackerGoalValue)}
        </ThemedText>

        {yesterdayPageValue.value > 0 && (
          <ThemedText style={[styles.infoText, { fontSize: 14 }]}>
            آخر صفحة من الأمس: {yesterdayPageValue.value}
          </ThemedText>
        )}

        {renderControlsContainer()}
      </ThemedView>
    );
  }

  function renderScrollView() {
    function renderNavigationSection2() {
      function renderResetButtonsContainer() {
        return (
          <ThemedView style={styles.resetButtonsContainer}>
            <ThemedButton
              variant="primary"
              style={styles.resetButton}
              onPress={() => setConfirmModalVisible(true)}
              accessibilityLabel="إعادة التعيين"
            >
              <ThemedView style={styles.resetButtonContent}>
                <Feather name="refresh-cw" size={16} color={textColor} />
                <ThemedText style={styles.resetButtonText}>
                  إعادة التعيين
                </ThemedText>
              </ThemedView>
            </ThemedButton>
          </ThemedView>
        );
      }
      return (
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
            {typeof savedPage === 'number' ? savedPage : 'غير محددة'}) بآخر صفحة
            قرأتها بالأمس، وتحديد عدد الأحزاب المقروءة.
          </ThemedText>

          {renderResetButtonsContainer()}
        </ThemedView>
      );
    }
    return (
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {renderNavigationSection()}

        <ReadingChart />

        {renderNavigationSection2()}
      </ScrollView>
    );
  }

  function renderModalOverlay() {
    function renderModalContent() {
      function renderModalActions() {
        return (
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
              onPress={() => performReset()} // Call the reset logic
              style={styles.modalButton}
            >
              تأكيد
            </ThemedButton>
          </ThemedView>
        );
      }
      return (
        <ThemedView
          style={[styles.modalContent, { backgroundColor: cardColor }]}
          onStartShouldSetResponder={() => true}
        >
          <ThemedView
            style={[styles.modalHeader, { borderBottomColor: ivoryColor }]}
          >
            <ThemedText style={styles.modalTitle}>تأكيد</ThemedText>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setConfirmModalVisible(false)}
              accessibilityRole="button"
              accessibilityLabel="إغلاق نافذة التأكيد"
            >
              <Feather name="x" size={24} color={iconColor} />
            </TouchableOpacity>
          </ThemedView>

          <ThemedText style={styles.modalMessage}>
            هل أنت متأكد من رغبتك في إعادة تعيين التقدم؟
          </ThemedText>

          {renderModalActions()}
        </ThemedView>
      );
    }
    return (
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={() => setConfirmModalVisible(false)} // Close on overlay press
        accessibilityLabel="إغلاق نافذة التأكيد"
        accessibilityRole="button"
      >
        {/* Prevent modal closing when pressing inside content */}
        {renderModalContent()}
      </TouchableOpacity>
    );
  }
  return (
    <>
      <Stack.Screen options={{ title: 'الورد' }} />
      <Seo title="الورد - المصحف المفتوح" description="الورد في تطبيق المصحف" />
      <ThemedView style={styles.container}>
        {renderScrollView()}

        {/* Confirmation Modal */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={confirmModalVisible}
          onRequestClose={() => setConfirmModalVisible(false)}
        >
          {renderModalOverlay()}
        </Modal>
      </ThemedView>
    </>
  );
}
