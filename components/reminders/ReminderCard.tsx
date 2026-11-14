import React from 'react';
import { TouchableOpacity, View } from 'react-native';

import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import Toggle from 'react-native-toggle-input';

import { ThemedText, ThemedView } from '@/components';
import { styles } from '@/styles/screens/reminders.styles';
import { Reminder, ReminderPreset } from '@/types/reminder';

const DAY_LABELS: Record<number, string> = {
  1: 'الأحد',
  2: 'الاثنين',
  3: 'الثلاثاء',
  4: 'الأربعاء',
  5: 'الخميس',
  6: 'الجمعة',
  7: 'السبت',
};
const formatTimeArabic = (hour: number, minute: number): string => {
  const period = hour >= 12 ? 'م' : 'ص';
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  const formatNumber = (n: number) => n.toString().padStart(2, '0');
  return `${formatNumber(displayHour)}:${formatNumber(minute)} ${period}`;
};
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
type Props = {
  reminder: Reminder;
  primaryColor: string;
  iconColor: string;
  textColor: string;
  cardColor: string;
  dangerColor: string;
  handleToggle: (id: string) => void;
  handleEditTime: (reminder: Reminder) => void;
  setDeleteConfirmId: (id: string) => void;
};
export function ReminderCard(props: Props) {
  const {
    reminder,
    primaryColor,
    iconColor,
    textColor,
    cardColor,
    dangerColor,
    handleToggle,
    handleEditTime,
    setDeleteConfirmId,
  } = props;

  function renderCardHeader() {
    return (
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
    );
  }

  function renderTimeRow() {
    return (
      <TouchableOpacity
        style={styles.timeRow}
        onPress={() => handleEditTime(reminder)}
        activeOpacity={0.6}
        accessibilityLabel={`تعديل وقت التذكير ${formatTimeArabic(reminder.hour, reminder.minute)}`}
        accessibilityHint="اضغط لتغيير وقت التذكير"
        accessibilityRole="button"
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
    );
  }
  return (
    <ThemedView
      key={reminder.id}
      style={[styles.card, { backgroundColor: cardColor }]}
    >
      {renderCardHeader()}

      {renderTimeRow()}

      {/* Delete button for custom reminders only */}
      {reminder.preset === 'custom' && (
        <TouchableOpacity
          style={styles.deleteRow}
          onPress={() => setDeleteConfirmId(reminder.id)}
          activeOpacity={0.6}
          accessibilityLabel={`حذف تذكير ${reminder.title}`}
          accessibilityHint="اضغط لحذف هذا التذكير"
          accessibilityRole="button"
        >
          <Feather name="trash-2" size={16} color={dangerColor} />
          <ThemedText style={[styles.deleteText, { color: dangerColor }]}>
            حذف
          </ThemedText>
        </TouchableOpacity>
      )}
    </ThemedView>
  );
}
