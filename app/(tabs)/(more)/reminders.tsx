import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import uuid from 'expo-modules-core/src/uuid';
import { Stack } from 'expo-router';
import { useAtom } from 'jotai';
import Toggle from 'react-native-toggle-input';

import { ThemedButton } from '@/components/ThemedButton';
import { ThemedTextInput } from '@/components/ThemedInput';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import TimePicker from '@/components/TimePicker';
import { useColors } from '@/hooks/useColors';
import { remindersAtom } from '@/jotai/atoms';
import { Reminder, ReminderPreset } from '@/types/reminder';
import {
  cancelReminder,
  requestNotificationPermissions,
  scheduleReminder,
  syncReminders,
} from '@/utils/notifications';

/** Maps day-of-week number to Arabic label */
const DAY_LABELS: Record<number, string> = {
  1: 'الأحد',
  2: 'الاثنين',
  3: 'الثلاثاء',
  4: 'الأربعاء',
  5: 'الخميس',
  6: 'الجمعة',
  7: 'السبت',
};

/** Returns a formatted Arabic time string like ٨:٠٠ م */
const formatTimeArabic = (hour: number, minute: number): string => {
  const period = hour >= 12 ? 'م' : 'ص';
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  const arabicNumerals = (n: number) =>
    n
      .toString()
      .padStart(2, '0')
      .replace(/\d/g, (d) => '٠١٢٣٤٥٦٧٨٩'[parseInt(d)]);
  return `${arabicNumerals(displayHour)}:${arabicNumerals(minute)} ${period}`;
};

/** Returns a preset icon name */
const getPresetIcon = (
  preset: ReminderPreset,
): React.ComponentProps<typeof MaterialCommunityIcons>['name'] => {
  switch (preset) {
    case 'wird':
      return 'book-open-page-variant-outline';
    case 'mulk':
      return 'moon-waning-crescent';
    case 'kahf':
      return 'calendar-week';
    case 'custom':
      return 'bell-outline';
  }
};

export default function RemindersScreen() {
  const [reminders, setReminders] = useAtom(remindersAtom);
  const [permissionGranted, setPermissionGranted] = useState<boolean | null>(
    null,
  );
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
  const [timePickerVisible, setTimePickerVisible] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newHour, setNewHour] = useState(8);
  const [newMinute, setNewMinute] = useState(0);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const { primaryColor, cardColor, textColor, iconColor, dangerColor } =
    useColors();

  // Request permissions on first render
  useEffect(() => {
    const checkPermissions = async () => {
      if (Platform.OS === 'web') return;
      const granted = await requestNotificationPermissions();
      setPermissionGranted(granted);
    };
    checkPermissions();
  }, []);

  // Sync reminders with OS scheduler once when permissions are granted
  const hasSynced = useRef(false);
  useEffect(() => {
    if (
      Platform.OS === 'web' ||
      permissionGranted !== true ||
      hasSynced.current
    )
      return;
    const sync = async () => {
      try {
        const synced = await syncReminders(reminders);
        // Only update if something changed
        const changed = synced.some(
          (r, i) => r.notificationId !== reminders[i]?.notificationId,
        );
        if (changed) setReminders(synced);
        hasSynced.current = true;
      } catch (error) {
        console.error('Failed to sync reminders:', error);
      }
    };
    sync();
  }, [permissionGranted, reminders, setReminders]);

  /** Toggles a reminder on/off, scheduling or cancelling the notification */
  const handleToggle = useCallback(
    async (id: string) => {
      const prev = reminders;
      try {
        const updated = await Promise.all(
          reminders.map(async (r) => {
            if (r.id !== id) return r;

            if (r.enabled) {
              // Turning off
              if (r.notificationId) await cancelReminder(r.notificationId);
              return { ...r, enabled: false, notificationId: undefined };
            }

            // Turning on
            if (!permissionGranted) {
              const granted = await requestNotificationPermissions();
              setPermissionGranted(granted);
              if (!granted) {
                Alert.alert(
                  'الإذن مطلوب',
                  'يجب السماح بالإشعارات لتفعيل التذكيرات',
                );
                return r;
              }
            }
            const notificationId = await scheduleReminder({
              ...r,
              enabled: true,
            });
            return { ...r, enabled: true, notificationId };
          }),
        );
        setReminders(updated);
      } catch (error) {
        console.error('Failed to toggle reminder:', error);
        setReminders(prev);
        Alert.alert('خطأ', 'فشل تبديل التذكير. يرجى المحاولة مرة أخرى.');
      }
    },
    [reminders, permissionGranted, setReminders],
  );

  /** Opens time picker for a reminder */
  const handleEditTime = useCallback((reminder: Reminder) => {
    setEditingReminder(reminder);
    setTimePickerVisible(true);
  }, []);

  /** Saves the new time from the time picker */
  const handleTimeSave = useCallback(async () => {
    if (!editingReminder) return;

    const prev = reminders;
    try {
      const updated = await Promise.all(
        reminders.map(async (r) => {
          if (r.id !== editingReminder.id) return r;

          // Cancel old if active
          if (r.notificationId) await cancelReminder(r.notificationId);

          const updatedReminder = {
            ...r,
            hour: editingReminder.hour,
            minute: editingReminder.minute,
          };

          // Re-schedule if enabled
          if (updatedReminder.enabled) {
            const notificationId = await scheduleReminder(updatedReminder);
            return { ...updatedReminder, notificationId };
          }
          return { ...updatedReminder, notificationId: undefined };
        }),
      );

      setReminders(updated);
      setTimePickerVisible(false);
      setEditingReminder(null);
    } catch (error) {
      console.error('Failed to save reminder time:', error);
      setReminders(prev);
      Alert.alert('خطأ', 'فشل حفظ وقت التذكير. يرجى المحاولة مرة أخرى.');
    }
  }, [editingReminder, reminders, setReminders]);

  /** Adds a custom reminder */
  const handleAddCustom = useCallback(async () => {
    if (!newTitle.trim()) return;

    const newReminder: Reminder = {
      id: `custom-${uuid.v4()}`,
      title: newTitle.trim(),
      body: newTitle.trim(),
      enabled: false,
      hour: newHour,
      minute: newMinute,
      type: 'daily',
      preset: 'custom',
    };

    setReminders([...reminders, newReminder]);
    setAddModalVisible(false);
    setNewTitle('');
    setNewHour(8);
    setNewMinute(0);
  }, [newTitle, newHour, newMinute, reminders, setReminders]);

  /** Deletes a custom reminder */
  const handleDelete = useCallback(
    async (id: string) => {
      const reminder = reminders.find((r) => r.id === id);
      if (reminder?.notificationId) {
        try {
          await cancelReminder(reminder.notificationId);
        } catch (error) {
          console.error('Failed to cancel notification during delete:', error);
          Alert.alert('تنبيه', 'تم حذف التذكير لكن فشل إلغاء الإشعار.');
        }
      }
      setReminders(reminders.filter((r) => r.id !== id));
      setDeleteConfirmId(null);
    },
    [reminders, setReminders],
  );

  /** Renders a single reminder card */
  const renderReminderCard = (reminder: Reminder) => (
    <ThemedView
      key={reminder.id}
      style={[styles.card, { backgroundColor: cardColor }]}
    >
      <View style={styles.cardHeader}>
        <View style={styles.cardTitleRow}>
          <MaterialCommunityIcons
            name={getPresetIcon(reminder.preset)}
            size={22}
            color={reminder.enabled ? primaryColor : iconColor}
          />
          <ThemedText style={[styles.cardTitle, { color: textColor }]}>
            {reminder.title}
          </ThemedText>
        </View>
        <Toggle
          color={primaryColor}
          size={26}
          filled={true}
          circleColor="white"
          toggle={reminder.enabled}
          setToggle={() => handleToggle(reminder.id)}
        />
      </View>

      <TouchableOpacity
        style={styles.timeRow}
        onPress={() => handleEditTime(reminder)}
        activeOpacity={0.6}
      >
        <Feather name="clock" size={16} color={iconColor} />
        <ThemedText style={[styles.timeText, { color: textColor }]}>
          {formatTimeArabic(reminder.hour, reminder.minute)}
        </ThemedText>
        {reminder.type === 'weekly' && reminder.dayOfWeek && (
          <ThemedText style={[styles.dayBadge, { color: primaryColor }]}>
            {DAY_LABELS[reminder.dayOfWeek]}
          </ThemedText>
        )}
        <Feather
          name="edit-2"
          size={14}
          color={iconColor}
          style={styles.editIcon}
        />
      </TouchableOpacity>

      {/* Delete button for custom reminders only */}
      {reminder.preset === 'custom' && (
        <TouchableOpacity
          style={styles.deleteRow}
          onPress={() => setDeleteConfirmId(reminder.id)}
          activeOpacity={0.6}
        >
          <Feather name="trash-2" size={16} color={dangerColor} />
          <ThemedText style={[styles.deleteText, { color: dangerColor }]}>
            حذف
          </ThemedText>
        </TouchableOpacity>
      )}
    </ThemedView>
  );

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: 'التذكيرات' }} />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Permission warning */}
        {permissionGranted === false && (
          <ThemedView
            style={[
              styles.warningBanner,
              { backgroundColor: dangerColor + '15' },
            ]}
          >
            <Feather name="alert-circle" size={18} color={dangerColor} />
            <ThemedText style={[styles.warningText, { color: dangerColor }]}>
              لم يتم السماح بالإشعارات. فعّل الإشعارات من إعدادات الجهاز.
            </ThemedText>
          </ThemedView>
        )}

        {/* Preset reminders section */}
        <ThemedText style={[styles.sectionTitle, { color: textColor }]}>
          التذكيرات المقترحة
        </ThemedText>
        {reminders.filter((r) => r.preset !== 'custom').map(renderReminderCard)}

        {/* Custom reminders section */}
        {reminders.some((r) => r.preset === 'custom') && (
          <>
            <ThemedText style={[styles.sectionTitle, { color: textColor }]}>
              تذكيرات مخصصة
            </ThemedText>
            {reminders
              .filter((r) => r.preset === 'custom')
              .map(renderReminderCard)}
          </>
        )}

        {/* Add custom reminder button */}
        <ThemedButton
          variant="outlined-primary"
          onPress={() => setAddModalVisible(true)}
          style={styles.addButton}
        >
          <View style={styles.addButtonContent}>
            <Feather name="plus" size={20} color={primaryColor} />
            <ThemedText style={[styles.addButtonText, { color: primaryColor }]}>
              إضافة تذكير
            </ThemedText>
          </View>
        </ThemedButton>
      </ScrollView>

      {/* Time Picker Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={timePickerVisible}
        onRequestClose={() => {
          setTimePickerVisible(false);
          setEditingReminder(null);
        }}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => {
              setTimePickerVisible(false);
              setEditingReminder(null);
            }}
          />
          <ThemedView
            style={[styles.modalContent, { backgroundColor: cardColor }]}
          >
            <ThemedView
              style={[styles.modalHeader, { borderBottomColor: textColor }]}
            >
              <ThemedText style={[styles.modalTitle, { color: textColor }]}>
                اختر الوقت
              </ThemedText>
              <TouchableOpacity
                onPress={() => {
                  setTimePickerVisible(false);
                  setEditingReminder(null);
                }}
              >
                <Feather name="x" size={24} color={iconColor} />
              </TouchableOpacity>
            </ThemedView>

            {editingReminder && (
              <TimePicker
                hour={editingReminder.hour}
                minute={editingReminder.minute}
                onChange={({ hour, minute }) =>
                  setEditingReminder((prev) =>
                    prev ? { ...prev, hour, minute } : null,
                  )
                }
              />
            )}

            <ThemedView style={styles.modalActions}>
              <ThemedButton
                variant="primary"
                onPress={handleTimeSave}
                style={styles.modalButton}
              >
                حفظ
              </ThemedButton>
            </ThemedView>
          </ThemedView>
        </View>
      </Modal>

      {/* Add Custom Reminder Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={addModalVisible}
        onRequestClose={() => setAddModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setAddModalVisible(false)}
          />
          <ThemedView
            style={[styles.modalContent, { backgroundColor: cardColor }]}
          >
            <ThemedView
              style={[styles.modalHeader, { borderBottomColor: textColor }]}
            >
              <ThemedText style={[styles.modalTitle, { color: textColor }]}>
                تذكير جديد
              </ThemedText>
              <TouchableOpacity onPress={() => setAddModalVisible(false)}>
                <Feather name="x" size={24} color={iconColor} />
              </TouchableOpacity>
            </ThemedView>

            <ThemedTextInput
              value={newTitle}
              onChangeText={setNewTitle}
              placeholder="عنوان التذكير"
              style={[
                styles.titleInput,
                { color: textColor, borderColor: iconColor },
              ]}
            />

            <TimePicker
              hour={newHour}
              minute={newMinute}
              onChange={({ hour, minute }) => {
                setNewHour(hour);
                setNewMinute(minute);
              }}
            />

            <ThemedView style={styles.modalActions}>
              <ThemedButton
                variant="primary"
                onPress={handleAddCustom}
                style={styles.modalButton}
              >
                إضافة
              </ThemedButton>
            </ThemedView>
          </ThemedView>
        </View>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={deleteConfirmId !== null}
        onRequestClose={() => setDeleteConfirmId(null)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setDeleteConfirmId(null)}
        >
          <ThemedView
            style={[styles.modalContent, { backgroundColor: cardColor }]}
            onStartShouldSetResponder={() => true}
          >
            <ThemedView
              style={[styles.modalHeader, { borderBottomColor: textColor }]}
            >
              <ThemedText style={[styles.modalTitle, { color: textColor }]}>
                حذف التذكير
              </ThemedText>
              <TouchableOpacity onPress={() => setDeleteConfirmId(null)}>
                <Feather name="x" size={24} color={iconColor} />
              </TouchableOpacity>
            </ThemedView>

            <ThemedText style={[styles.modalMessage, { color: textColor }]}>
              هل أنت متأكد من حذف هذا التذكير؟
            </ThemedText>

            <ThemedView style={styles.modalActionsRow}>
              <ThemedButton
                variant="outlined-primary"
                onPress={() => setDeleteConfirmId(null)}
                style={styles.modalButton}
              >
                إلغاء
              </ThemedButton>
              <ThemedButton
                variant="danger"
                onPress={() => deleteConfirmId && handleDelete(deleteConfirmId)}
                style={styles.modalButton}
              >
                حذف
              </ThemedButton>
            </ThemedView>
          </ThemedView>
        </TouchableOpacity>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Tajawal_700Bold',
    marginTop: 8,
    marginBottom: 4,
  },
  card: {
    borderRadius: 12,
    padding: 14,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontFamily: 'Tajawal_700Bold',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
  },
  timeText: {
    fontSize: 16,
    fontFamily: 'Tajawal_400Regular',
  },
  dayBadge: {
    fontSize: 14,
    fontFamily: 'Tajawal_700Bold',
    marginStart: 8,
  },
  editIcon: {
    marginStart: 'auto',
  },
  deleteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  deleteText: {
    fontSize: 14,
    fontFamily: 'Tajawal_400Regular',
  },
  addButton: {
    marginTop: 12,
    height: 48,
  },
  addButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  addButtonText: {
    fontSize: 16,
    fontFamily: 'Tajawal_700Bold',
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 10,
  },
  warningText: {
    fontSize: 14,
    fontFamily: 'Tajawal_400Regular',
    flex: 1,
  },
  // Modal styles (consistent with existing patterns)
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
    minHeight: 40,
    backgroundColor: 'transparent',
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'Tajawal_700Bold',
    textAlignVertical: 'center',
  },
  modalMessage: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
    fontFamily: 'Tajawal_400Regular',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    width: '100%',
    marginTop: 12,
  },
  modalActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'transparent',
    width: '100%',
    gap: 12,
  },
  modalButton: {
    width: '40%',
    maxWidth: 140,
  },
  titleInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    fontFamily: 'Tajawal_400Regular',
    marginBottom: 12,
    textAlign: 'right',
  },
});
