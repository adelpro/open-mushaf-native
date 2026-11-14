import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Linking,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';

import uuid from 'expo-modules-core/src/uuid';
import { Stack } from 'expo-router';
import { useAtom } from 'jotai';
import {
  checkPermission as checkExactAlarmPermission,
  getPermission as openExactAlarmPermissionSettings,
} from 'react-native-schedule-exact-alarm-permission';

import { ThemedView } from '@/components';
import { ModalContent } from '@/components/reminders/ModalContent';
import { ModalContent2 } from '@/components/reminders/ModalContent2';
import { ModalOverlay } from '@/components/reminders/ModalOverlay';
import { ReminderCard } from '@/components/reminders/ReminderCard';
import { ReminderListView } from '@/components/reminders/ReminderListView';
import { ReminderModal } from '@/components/reminders/ReminderModal';
import { ERROR_MESSAGES } from '@/constants/errorMessages';
import { useColors } from '@/hooks';
import { remindersAtom } from '@/jotai/atoms';
import { styles } from '@/styles/screens/reminders.styles';
import { Reminder } from '@/types/reminder';
import {
  cancelReminder,
  requestNotificationPermissions,
  scheduleReminder,
  syncReminders,
} from '@/utils/notifications';

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

  const hasShownExactAlarmHint = useRef(false);
  const isCheckingExactAlarmPermission = useRef(false);

  const maybeShowExactAlarmHint = useCallback(async () => {
    if (
      Platform.OS !== 'android' ||
      Number(Platform.Version) < 31 ||
      hasShownExactAlarmHint.current ||
      isCheckingExactAlarmPermission.current
    ) {
      return;
    }

    isCheckingExactAlarmPermission.current = true;

    try {
      const hasExactAlarmPermission = await checkExactAlarmPermission();

      if (hasExactAlarmPermission) {
        return;
      }

      hasShownExactAlarmHint.current = true;

      Alert.alert(
        'السماح بالمنبهات والتذكيرات',
        'فعّل صلاحية "المنبهات والتذكيرات" حتى تصل تذكيرات الورد في وقتها المحدد.',
        [
          {
            text: 'لاحقًا',
            style: 'cancel',
          },
          {
            text: 'فتح الإعدادات',
            onPress: () => {
              try {
                openExactAlarmPermissionSettings();
              } catch (error) {
                console.error(
                  'Failed to open exact alarm permission settings:',
                  error,
                );
                void Linking.openSettings();
              }
            },
          },
        ],
      );
    } catch (error) {
      console.error('Failed to check exact alarm permission:', error);
    } finally {
      isCheckingExactAlarmPermission.current = false;
    }
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
              // Wird occurrences are reconciled centrally by
              // useWirdReminderSync; changing the state is enough to cancel
              // its managed one-off notifications.
              if (r.preset === 'wird') {
                return {
                  ...r,
                  enabled: false,
                  notificationId: undefined,
                };
              }

              // Turning off a standard reminder.
              if (r.notificationId) await cancelReminder(r.notificationId);
              return { ...r, enabled: false, notificationId: undefined };
            }

            // Turning on.
            if (!permissionGranted) {
              const granted = await requestNotificationPermissions();
              setPermissionGranted(granted);
              if (!granted) {
                Alert.alert('الإذن مطلوب', ERROR_MESSAGES.PERMISSION_REQUIRED);
                return r;
              }
            }

            if (r.preset === 'wird') {
              await maybeShowExactAlarmHint();

              return {
                ...r,
                enabled: true,
                notificationId: undefined,
              };
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
        Alert.alert('خطأ', ERROR_MESSAGES.REMINDER_TOGGLE_FAILED);
      }
    },
    [reminders, permissionGranted, setReminders, maybeShowExactAlarmHint],
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

          const updatedReminder = {
            ...r,
            hour: editingReminder.hour,
            minute: editingReminder.minute,
          };

          // Wird reminders are reconciled centrally. Their identifier includes
          // the selected time, so the old occurrences are removed and the new
          // ones are created automatically after this state update.
          if (r.preset === 'wird') {
            return {
              ...updatedReminder,
              notificationId: undefined,
            };
          }

          // Cancel the old standard reminder before replacing it.
          if (r.notificationId) await cancelReminder(r.notificationId);

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
      Alert.alert('خطأ', ERROR_MESSAGES.REMINDER_SAVE_FAILED);
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
          Alert.alert('تنبيه', ERROR_MESSAGES.REMINDER_CANCEL_FAILED);
        }
      }
      setReminders(reminders.filter((r) => r.id !== id));
      setDeleteConfirmId(null);
    },
    [reminders, setReminders],
  );

  /** Renders a single reminder card */
  const renderReminderCard = (reminder: Reminder) => {
    return (
      <ReminderCard
        key={reminder.id}
        reminder={reminder}
        primaryColor={primaryColor}
        iconColor={iconColor}
        textColor={textColor}
        cardColor={cardColor}
        dangerColor={dangerColor}
        handleToggle={handleToggle}
        handleEditTime={handleEditTime}
        setDeleteConfirmId={setDeleteConfirmId}
      />
    );
  };

  const renderModalContent = () => {
    return (
      <ModalContent
        cardColor={cardColor}
        textColor={textColor}
        setTimePickerVisible={setTimePickerVisible}
        setEditingReminder={setEditingReminder}
        iconColor={iconColor}
        editingReminder={editingReminder}
        handleTimeSave={handleTimeSave}
      />
    );
  };

  function renderModal() {
    function renderModalOverlay() {
      return (
        <View style={styles.modalOverlay}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setAddModalVisible(false)}
          />
          <ModalContent2
            cardColor={cardColor}
            textColor={textColor}
            setAddModalVisible={setAddModalVisible}
            iconColor={iconColor}
            newTitle={newTitle}
            setNewTitle={setNewTitle}
            newHour={newHour}
            newMinute={newMinute}
            setNewHour={setNewHour}
            setNewMinute={setNewMinute}
            handleAddCustom={handleAddCustom}
          />
        </View>
      );
    }
    return (
      <Modal
        animationType="fade"
        transparent={true}
        visible={addModalVisible}
        onRequestClose={() => setAddModalVisible(false)}
      >
        {renderModalOverlay()}
      </Modal>
    );
  }

  function renderModal2() {
    return (
      <Modal
        animationType="fade"
        transparent={true}
        visible={deleteConfirmId !== null}
        onRequestClose={() => setDeleteConfirmId(null)}
      >
        <ModalOverlay
          cardColor={cardColor}
          textColor={textColor}
          setDeleteConfirmId={setDeleteConfirmId}
          iconColor={iconColor}
          deleteConfirmId={deleteConfirmId}
          handleDelete={handleDelete}
        />
      </Modal>
    );
  }
  function renderScreenContent() {
    return (
      <ThemedView style={styles.container}>
        <Stack.Screen options={{ title: 'التذكيرات' }} />
        <ReminderListView
          permissionGranted={permissionGranted}
          dangerColor={dangerColor}
          textColor={textColor}
          reminders={reminders}
          renderReminderCard={renderReminderCard}
          setAddModalVisible={setAddModalVisible}
          primaryColor={primaryColor}
        />

        {/* Time Picker Modal */}
        <ReminderModal
          timePickerVisible={timePickerVisible}
          setTimePickerVisible={setTimePickerVisible}
          setEditingReminder={setEditingReminder}
          renderModalContent={renderModalContent}
        />

        {/* Add Custom Reminder Modal */}
        {renderModal()}

        {/* Delete Confirmation Modal */}
        {renderModal2()}
      </ThemedView>
    );
  }
  return renderScreenContent();
}
