import { useState } from 'react';
import { Linking } from 'react-native';

import * as StoreReview from 'expo-store-review';
import { ScrollView } from 'react-native-gesture-handler';

import { Seo, ThemedButton, ThemedView } from '@/components';
import { FlipSoundSetting } from '@/components/settings/FlipSoundSetting';
import { GestureSensitivitySetting } from '@/components/settings/GestureSensitivitySetting';
import { HizbNotificationSetting } from '@/components/settings/HizbNotificationSetting';
import { ModalContent } from '@/components/settings/ModalContent';
import { MushafContrastSetting } from '@/components/settings/MushafContrastSetting';
import { PassengerMotionSetting } from '@/components/settings/PassengerMotionSetting';
import { ReadingModeSetting } from '@/components/settings/ReadingModeSetting';
import { ReadingThemeSetting } from '@/components/settings/ReadingThemeSetting';
import { ReminderModal } from '@/components/settings/ReminderModal';
import { RiwayaSetting } from '@/components/settings/RiwayaSetting';
import { TrackerNotificationSetting } from '@/components/settings/TrackerNotificationSetting';
import { useColors } from '@/hooks';
import { styles } from '@/styles/screens/settings.styles';
import { isWeb } from '@/utils';

export default function SettingsScreen() {
  const { cardColor, iconColor } = useColors();
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const renderModalContent = () => {
    return (
      <ModalContent
        setConfirmModalVisible={setConfirmModalVisible}
        cardColor={cardColor}
        iconColor={iconColor}
      />
    );
  };

  function renderSettingsSection() {
    return (
      <ThemedView
        style={[
          styles.settingsSection,
          styles.columnSection,
          { backgroundColor: cardColor },
        ]}
      >
        <ThemedButton
          role="button"
          variant="danger"
          onPress={() => {
            setConfirmModalVisible(true);
          }}
        >
          إعادة ضبط التطبيق
        </ThemedButton>
      </ThemedView>
    );
  }

  function renderSettingsSection2() {
    return (
      <ThemedView
        style={[
          styles.settingsSection,
          styles.columnSection,
          { backgroundColor: cardColor },
        ]}
      >
        <ThemedButton
          role="button"
          variant="outlined-primary"
          onPress={async () => {
            const url = StoreReview.storeUrl();
            if (url) {
              await Linking.openURL(url);
            }
          }}
        >
          ⭐ تقييم التطبيق على المتجر
        </ThemedButton>
      </ThemedView>
    );
  }
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Seo
        title="المصحف المفتوح - الإعدادات"
        description="إعدادات التطبيق - تخصيص المظهر والإشعارات والرواية"
      />
      <FlipSoundSetting />

      {/* New Toggle for showDailyHizbCompletedBorder */}
      <TrackerNotificationSetting />

      <MushafContrastSetting />

      <GestureSensitivitySetting />

      <HizbNotificationSetting />

      <ReadingThemeSetting />

      <ReadingModeSetting />

      <RiwayaSetting />
      <PassengerMotionSetting />

      {!isWeb && renderSettingsSection2()}

      {renderSettingsSection()}

      {/* Confirmation Modal */}
      <ReminderModal
        confirmModalVisible={confirmModalVisible}
        setConfirmModalVisible={setConfirmModalVisible}
        renderModalContent={renderModalContent}
      />
    </ScrollView>
  );
}
