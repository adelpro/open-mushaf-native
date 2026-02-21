import React, { useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
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
import { useUpdateAndroidWidget } from '@/hooks/useUpdateAndroidWidget';
import {
  dailyTrackerCompleted,
  dailyTrackerGoal,
  yesterdayPage,
} from '@/jotai/atoms';

export default function TrackerScreen() {
  const { iconColor, cardColor, primaryColor, textColor, primaryLightColor } =
    useColors();
  const { currentSavedPage: savedPage } = useCurrentPage();
  const { updateAndroidWidget } = useUpdateAndroidWidget();

  const [dailyTrackerGoalValue, setdailyTrackerGoalValue] =
    useAtom(dailyTrackerGoal);
  const [dailyTrackerCompletedValue, setdailyTrackerCompletedValue] = useAtom(
    dailyTrackerCompleted,
  );
  const [yesterdayPageValue, setYesterdayPageValue] = useAtom(yesterdayPage);

  const [confirmModalVisible, setConfirmModalVisible] = useState(false);

  // حساب نسبة الإنجاز
  const dailyProgress =
    dailyTrackerGoalValue > 0
      ? Math.min(
          100,
          (dailyTrackerCompletedValue.value / 8 / (dailyTrackerGoalValue / 8)) *
            100,
        )
      : 0;

  const incrementDailyGoal = () => setdailyTrackerGoalValue((prev) => prev + 1);
  const decrementDailyGoal = () =>
    setdailyTrackerGoalValue((prev) => Math.max(1, prev - 1));

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

    await updateAndroidWidget();
    setConfirmModalVisible(false);
  };

  const getHizbText = (count: number) => {
    if (count === 0) return '0 أحزاب';
    if (count === 1) return 'حزب واحد';
    if (count === 2) return 'حزبين';
    if (count >= 3 && count <= 10) return `${count} أحزاب`;
    return `${count} حزباً`;
  };

  return (
    <>
      <Stack.Screen options={{ title: 'الورد اليومي' }} />
      <SEO
        title="الورد - المصحف المفتوح"
        description="متابعة الورد اليومي في تطبيق المصحف"
      />

      <ThemedView style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* بطاقة الإنجاز اليومي */}
          <ThemedView
            style={[styles.card, { backgroundColor: cardColor }]}
            accessible={true}
            accessibilityLabel={`إنجازك اليومي هو ${dailyProgress.toFixed(0)} بالمائة. قرأت ${getHizbText(dailyTrackerCompletedValue.value)}.`}
          >
            <View style={styles.labelContainer}>
              <Feather name="trending-up" size={22} color={primaryColor} />
              <ThemedText style={styles.label}>تقدمك اليومي</ThemedText>
            </View>

            <View
              style={styles.progressWrapper}
              accessible={true}
              accessibilityRole="progressbar"
              accessibilityValue={{
                now: dailyProgress,
                min: 0,
                max: 100,
                text: `${dailyProgress.toFixed(0)}%`,
              }}
            >
              <View style={styles.progressBackground}>
                <View
                  style={[
                    styles.progressBar,
                    {
                      width: `${dailyProgress}%`,
                      backgroundColor: primaryColor,
                    },
                  ]}
                />
              </View>
              <ThemedText style={styles.progressPercentText}>
                {dailyProgress.toFixed(1)}%
              </ThemedText>
            </View>

            <ThemedText style={styles.infoText}>
              أتممت قراءة{' '}
              <ThemedText
                type="defaultSemiBold"
                style={{ color: primaryColor }}
              >
                {Number.isInteger(dailyTrackerCompletedValue.value)
                  ? getHizbText(dailyTrackerCompletedValue.value)
                  : `${dailyTrackerCompletedValue.value.toFixed(1)} حزباً`}
              </ThemedText>{' '}
              من أصل {getHizbText(dailyTrackerGoalValue)}
            </ThemedText>

            {yesterdayPageValue.value > 0 && (
              <ThemedText style={styles.yesterdayText}>
                آخر صفحة قرأتها بالأمس: {yesterdayPageValue.value}
              </ThemedText>
            )}

            <View style={styles.divider} />

            {/* التحكم في الهدف */}
            <View style={styles.controlsSection}>
              <ThemedText style={styles.controlLabel}>
                تعديل الهدف اليومي:
              </ThemedText>
              <View style={styles.counterContainer}>
                <TouchableOpacity
                  style={[
                    styles.counterButton,
                    { borderColor: primaryLightColor },
                  ]}
                  onPress={decrementDailyGoal}
                  accessibilityLabel="تقليل الهدف بمقدار حزب"
                >
                  <Feather name="minus" size={18} color={primaryColor} />
                </TouchableOpacity>

                <ThemedText style={styles.counterValue}>
                  {getHizbText(dailyTrackerGoalValue)}
                </ThemedText>

                <TouchableOpacity
                  style={[
                    styles.counterButton,
                    { borderColor: primaryLightColor },
                  ]}
                  onPress={incrementDailyGoal}
                  accessibilityLabel="زيادة الهدف بمقدار حزب"
                >
                  <Feather name="plus" size={18} color={primaryColor} />
                </TouchableOpacity>
              </View>
            </View>
          </ThemedView>

          {/* بطاقة معلومات التقسيم */}
          <ThemedView style={[styles.card, { backgroundColor: cardColor }]}>
            <View style={styles.labelContainer}>
              <Feather name="info" size={22} color={primaryColor} />
              <ThemedText style={styles.label}>كيف يتم الحساب؟</ThemedText>
            </View>

            <ThemedText style={styles.descriptionText}>
              يُحسب الورد تلقائياً بمقارنة الصفحة التي وصلت إليها الآن (صفحة{' '}
              {savedPage}) مع الصفحة التي توقفت عندها بالأمس.
            </ThemedText>

            <ThemedButton
              variant="primary"
              style={styles.resetButton}
              onPress={() => setConfirmModalVisible(true)}
              accessibilityLabel="إعادة تعيين الورد اليومي"
            >
              <View style={styles.resetButtonContent}>
                <Feather name="refresh-cw" size={18} color="white" />
                <Text style={styles.resetButtonText}>إعادة تعيين اليوم</Text>
              </View>
            </ThemedButton>
          </ThemedView>
        </ScrollView>

        {/* مودال التأكيد */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={confirmModalVisible}
          onRequestClose={() => setConfirmModalVisible(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setConfirmModalVisible(false)}
          >
            <ThemedView
              style={[
                styles.modalContent,
                {
                  backgroundColor: cardColor,
                  borderColor: primaryLightColor,
                  borderWidth: 1,
                },
              ]}
              onStartShouldSetResponder={() => true}
            >
              <View style={styles.modalHeader}>
                <ThemedText type="defaultSemiBold" style={styles.modalTitle}>
                  تأكيد الإجراء
                </ThemedText>
                <TouchableOpacity onPress={() => setConfirmModalVisible(false)}>
                  <Feather name="x" size={22} color={iconColor} />
                </TouchableOpacity>
              </View>

              <ThemedText style={styles.modalMessage}>
                هل تريد حقاً تصفير تقدمك لهذا اليوم والبدء من جديد؟
              </ThemedText>

              <View style={styles.modalActions}>
                <ThemedButton
                  variant="outlined-primary"
                  onPress={() => setConfirmModalVisible(false)}
                  style={styles.modalBtn}
                >
                  إلغاء
                </ThemedButton>
                <ThemedButton
                  variant="primary"
                  onPress={performReset}
                  style={styles.modalBtn}
                >
                  تأكيد
                </ThemedButton>
              </View>
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
  },
  scrollView: {
    width: '100%',
  },
  scrollContent: {
    padding: 20,
    alignItems: 'center',
    maxWidth: 600,
    alignSelf: 'center',
    width: '100%',
  },
  card: {
    width: '100%',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 20,
  },
  label: {
    fontSize: 20,
    fontFamily: 'Tajawal_700Bold',
  },
  progressWrapper: {
    marginBottom: 15,
  },
  progressBackground: {
    height: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 6,
  },
  progressPercentText: {
    textAlign: 'left',
    fontSize: 14,
    marginTop: 5,
    fontFamily: 'Tajawal_700Bold',
  },
  infoText: {
    fontSize: 17,
    fontFamily: 'Tajawal_400Regular',
    lineHeight: 26,
    textAlign: 'right',
  },
  yesterdayText: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: 8,
    textAlign: 'right',
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 20,
  },
  controlsSection: {
    alignItems: 'center',
  },
  controlLabel: {
    fontSize: 16,
    marginBottom: 15,
    fontFamily: 'Tajawal_500Medium',
  },
  counterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  counterButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterValue: {
    fontSize: 18,
    fontFamily: 'Tajawal_700Bold',
    minWidth: 80,
    textAlign: 'center',
  },
  descriptionText: {
    fontSize: 15,
    lineHeight: 24,
    marginBottom: 25,
    textAlign: 'right',
  },
  resetButton: {
    height: 50,
    borderRadius: 12,
  },
  resetButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  resetButtonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Tajawal_700Bold',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    maxWidth: 380,
    borderRadius: 20,
    padding: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 20,
  },
  modalMessage: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 30,
    textAlign: 'center',
    fontFamily: 'Tajawal_400Regular',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalBtn: {
    width: '48%',
  },
});
