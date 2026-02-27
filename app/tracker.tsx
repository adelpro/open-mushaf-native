// Import useState, Modal, and Feather
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
} from 'react-native';

import { Feather } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import { useAtom } from 'jotai/react';
import Toggle from 'react-native-toggle-input';

import SEO from '@/components/seo';
import { ThemedButton } from '@/components/ThemedButton';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import TimePicker from '@/components/TimePicker';
import { useColors } from '@/hooks/useColors';
import useCurrentPage from '@/hooks/useCurrentPage';
import { useUpdateAndroidWidget } from '@/hooks/useUpdateAndroidWidget';
import {
  dailyTrackerCompleted,
  dailyTrackerGoal,
  remindersAtom,
  yesterdayPage,
} from '@/jotai/atoms';
import {
  cancelReminder,
  requestNotificationPermissions,
  scheduleReminder,
} from '@/utils/notifications';

const formatTimeArabic = (hour: number, minute: number): string => {
  const period = hour >= 12 ? 'م' : 'ص';
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  const arabicNumerals = (n: number) =>
    n
      .toString()
      .padStart(2, '0')
      .replace(/\d/g, (d) => '٠١٢٣٤٥٦٧٨٩'[parseInt(d, 10)]);
  return `${arabicNumerals(displayHour)}:${arabicNumerals(minute)} ${period}`;
};

// Screen component intentionally coordinates multiple tracker/reminder flows.
// eslint-disable-next-line max-lines-per-function
export default function TrackerScreen() {
  const { iconColor, cardColor, primaryColor } = useColors();
  const { currentSavedPage: savedPage } = useCurrentPage();

  const { updateAndroidWidget } = useUpdateAndroidWidget();

  const [dailyTrackerGoalValue, setdailyTrackerGoalValue] =
    useAtom(dailyTrackerGoal);
  const [dailyTrackerCompletedValue, setdailyTrackerCompletedValue] = useAtom(
    dailyTrackerCompleted,
  );
  const [yesterdayPageValue, setYesterdayPageValue] = useAtom(yesterdayPage);
  const [reminders, setReminders] = useAtom(remindersAtom);
  // Add state for modal visibility
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [timePickerVisible, setTimePickerVisible] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState<boolean | null>(
    null,
  );
  const [reminderHour, setReminderHour] = useState(20);
  const [reminderMinute, setReminderMinute] = useState(0);

  const wirdReminder = reminders.find((reminder) => reminder.preset === 'wird');

  useEffect(() => {
    if (!wirdReminder) return;
    setReminderHour(wirdReminder.hour);
    setReminderMinute(wirdReminder.minute);
  }, [wirdReminder]);

  useEffect(() => {
    const checkPermissions = async () => {
      if (Platform.OS === 'web') return;
      const granted = await requestNotificationPermissions();
      setPermissionGranted(granted);
    };
    void checkPermissions();
  }, []);

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

  // eslint-disable-next-line max-lines-per-function
  const handleToggleWirdReminder = async () => {
    if (!wirdReminder) return;

    const previousReminders = reminders;
    try {
      const updatedReminders = await Promise.all(
        reminders.map(async (reminder) => {
          if (reminder.preset !== 'wird') return reminder;

          if (reminder.enabled) {
            if (reminder.notificationId) {
              await cancelReminder(reminder.notificationId);
            }
            return { ...reminder, enabled: false, notificationId: undefined };
          }

          if (Platform.OS !== 'web' && !permissionGranted) {
            const granted = await requestNotificationPermissions();
            setPermissionGranted(granted);
            if (!granted) {
              Alert.alert(
                'الإذن مطلوب',
                'يجب السماح بالإشعارات لتفعيل تذكير الورد.',
              );
              return reminder;
            }
          }

          if (Platform.OS === 'web') {
            return {
              ...reminder,
              enabled: true,
              hour: reminderHour,
              minute: reminderMinute,
              notificationId: undefined,
            };
          }

          const notificationId = await scheduleReminder({
            ...reminder,
            enabled: true,
            hour: reminderHour,
            minute: reminderMinute,
          });
          return {
            ...reminder,
            enabled: true,
            hour: reminderHour,
            minute: reminderMinute,
            notificationId,
          };
        }),
      );
      setReminders(updatedReminders);
    } catch (error) {
      console.error('Failed to toggle wird reminder:', error);
      setReminders(previousReminders);
      Alert.alert('خطأ', 'تعذر تحديث تذكير الورد. حاول مرة أخرى.');
    }
  };

  const handleSaveReminderTime = async () => {
    if (!wirdReminder) return;

    const previousReminders = reminders;
    try {
      const updatedReminders = await Promise.all(
        reminders.map(async (reminder) => {
          if (reminder.preset !== 'wird') return reminder;

          if (reminder.notificationId) {
            await cancelReminder(reminder.notificationId);
          }

          const updatedReminder = {
            ...reminder,
            hour: reminderHour,
            minute: reminderMinute,
          };

          if (!updatedReminder.enabled || Platform.OS === 'web') {
            return { ...updatedReminder, notificationId: undefined };
          }

          const notificationId = await scheduleReminder(updatedReminder);
          return { ...updatedReminder, notificationId };
        }),
      );

      setReminders(updatedReminders);
      setTimePickerVisible(false);
    } catch (error) {
      console.error('Failed to save wird reminder time:', error);
      setReminders(previousReminders);
      Alert.alert('خطأ', 'تعذر حفظ وقت تذكير الورد. حاول مرة أخرى.');
    }
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
                    accessibilityRole="button"
                    accessibilityLabel="تقليل الهدف اليومي"
                  >
                    <Feather name="minus" size={20} color={primaryColor} />
                  </TouchableOpacity>
                  <ThemedText style={styles.controlValue}>
                    {getHizbText(dailyTrackerGoalValue)}
                  </ThemedText>
                  <TouchableOpacity
                    style={styles.controlButton}
                    onPress={incrementDailyGoal}
                    accessibilityRole="button"
                    accessibilityLabel="زيادة الهدف اليومي"
                  >
                    <Feather name="plus" size={20} color={primaryColor} />
                  </TouchableOpacity>
                </ThemedView>
              </ThemedView>
            </ThemedView>

            <ThemedView style={styles.reminderContainer}>
              <ThemedView style={styles.reminderHeader}>
                <ThemedView
                  style={[styles.labelContainer, { marginBottom: 0, gap: 8 }]}
                >
                  <Feather name="clock" size={20} color={primaryColor} />
                  <ThemedText style={styles.controlLabel}>
                    تذكير الورد اليومي
                  </ThemedText>
                </ThemedView>
                <Toggle
                  color={primaryColor}
                  size={32}
                  circleColor={primaryColor}
                  toggle={Boolean(wirdReminder?.enabled)}
                  setToggle={handleToggleWirdReminder}
                  aria-checked={Boolean(wirdReminder?.enabled)}
                  aria-label="تفعيل تذكير الورد اليومي"
                  accessibilityLabel="تفعيل تذكير الورد اليومي"
                  accessibilityState={{
                    checked: Boolean(wirdReminder?.enabled),
                  }}
                />
              </ThemedView>

              <TouchableOpacity
                style={[
                  styles.reminderTimeButton,
                  { borderColor: primaryColor + '66' },
                ]}
                onPress={() => {
                  setTimePickerVisible(true);
                }}
                accessibilityRole="button"
                accessibilityLabel="تعديل وقت تذكير الورد اليومي"
              >
                <ThemedText style={styles.reminderTimeText}>
                  وقت التذكير: {formatTimeArabic(reminderHour, reminderMinute)}
                </ThemedText>
              </TouchableOpacity>
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
                onPress={() => {
                  setConfirmModalVisible(true);
                }}
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
          onRequestClose={() => {
            setConfirmModalVisible(false);
          }}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => {
              setConfirmModalVisible(false);
            }} // Close on overlay press
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
                  onPress={() => {
                    setConfirmModalVisible(false);
                  }}
                  accessibilityRole="button"
                  accessibilityLabel="إغلاق نافذة التأكيد"
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
                  onPress={() => {
                    setConfirmModalVisible(false);
                  }} // Just close modal
                  style={styles.modalButton}
                >
                  إلغاء
                </ThemedButton>
                <ThemedButton
                  variant="primary"
                  onPress={() => {
                    void performReset();
                  }} // Call the reset logic
                  style={styles.modalButton}
                >
                  تأكيد
                </ThemedButton>
              </ThemedView>
            </ThemedView>
          </TouchableOpacity>
        </Modal>

        <Modal
          animationType="fade"
          transparent={true}
          visible={timePickerVisible}
          onRequestClose={() => {
            setTimePickerVisible(false);
          }}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => {
              setTimePickerVisible(false);
            }}
          >
            <ThemedView
              style={[styles.modalContent, { backgroundColor: cardColor }]}
              onStartShouldSetResponder={() => true}
            >
              <ThemedView style={styles.modalHeader}>
                <ThemedText style={styles.modalTitle}>
                  وقت تذكير الورد
                </ThemedText>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => {
                    setTimePickerVisible(false);
                  }}
                  accessibilityRole="button"
                  accessibilityLabel="إغلاق اختيار وقت التذكير"
                >
                  <Feather name="x" size={24} color={iconColor} />
                </TouchableOpacity>
              </ThemedView>

              <TimePicker
                hour={reminderHour}
                minute={reminderMinute}
                onChange={({ hour, minute }) => {
                  setReminderHour(hour);
                  setReminderMinute(minute);
                }}
              />

              <ThemedView style={styles.modalActions}>
                <ThemedButton
                  variant="outlined-primary"
                  onPress={() => {
                    setTimePickerVisible(false);
                  }}
                  style={styles.modalButton}
                >
                  إلغاء
                </ThemedButton>
                <ThemedButton
                  variant="primary"
                  onPress={handleSaveReminderTime}
                  style={styles.modalButton}
                >
                  حفظ
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
  reminderContainer: {
    marginTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 12,
    gap: 10,
  },
  reminderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  reminderTimeButton: {
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  reminderTimeText: {
    fontSize: 15,
    fontFamily: 'Tajawal_400Regular',
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
