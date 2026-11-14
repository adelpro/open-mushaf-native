import React, { Fragment } from 'react';
import { ScrollView } from 'react-native';

import { Feather } from '@expo/vector-icons';

import { ThemedButton, ThemedText, ThemedView } from '@/components';
import { styles } from '@/styles/screens/reminders.styles';
import { Reminder } from '@/types/reminder';

type Props = {
  permissionGranted: boolean | null;
  dangerColor: any;
  textColor: any;
  reminders: Reminder[];
  renderReminderCard: (reminder: Reminder) => React.JSX.Element;
  setAddModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
  primaryColor: any;
};
export function ReminderListView(props: Props) {
  const {
    permissionGranted,
    dangerColor,
    textColor,
    reminders,
    renderReminderCard,
    setAddModalVisible,
    primaryColor,
  } = props;

  function renderPermissionWarning() {
    return (
      <ThemedView
        style={[styles.warningBanner, { backgroundColor: dangerColor + '15' }]}
      >
        <Feather name="alert-circle" size={18} color={dangerColor} />
        <ThemedText style={[styles.warningText, { color: dangerColor }]}>
          لم يتم السماح بالإشعارات. فعّل الإشعارات من إعدادات الجهاز.
        </ThemedText>
      </ThemedView>
    );
  }
  return (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Permission warning */}
      {permissionGranted === false && renderPermissionWarning()}

      {/* Preset reminders section */}
      <ThemedText style={[styles.sectionTitle, { color: textColor }]}>
        التذكيرات المقترحة
      </ThemedText>
      {reminders.filter((r) => r.preset !== 'custom').map(renderReminderCard)}

      {/* Custom reminders section */}
      {reminders.some((r) => r.preset === 'custom') && (
        <Fragment>
          <ThemedText style={[styles.sectionTitle, { color: textColor }]}>
            تذكيرات مخصصة
          </ThemedText>
          {reminders
            .filter((r) => r.preset === 'custom')
            .map(renderReminderCard)}
        </Fragment>
      )}

      {/* Add custom reminder button */}
      <ThemedButton
        variant="outlined-primary"
        onPress={() => setAddModalVisible(true)}
        style={styles.addButton}
      >
        <ThemedView style={styles.addButtonContent}>
          <Feather name="plus" size={20} color={primaryColor} />
          <ThemedText style={[styles.addButtonText, { color: primaryColor }]}>
            إضافة تذكير
          </ThemedText>
        </ThemedView>
      </ThemedButton>
    </ScrollView>
  );
}
