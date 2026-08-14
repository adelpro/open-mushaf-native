import React, { useState } from 'react';
import {
  Modal,
  Platform,
  ScrollView,
  Share,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

import { Feather } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import BookmarkSVG from '@/assets/svgs/bookmark.svg';
import HelpSVG from '@/assets/svgs/help.svg';
import InfoSVG from '@/assets/svgs/info.svg';
import MailSVG from '@/assets/svgs/mail.svg';
import PageSVG from '@/assets/svgs/page.svg';
import SettingsSVG from '@/assets/svgs/settings.svg';
import ShareSVG from '@/assets/svgs/share.svg';
import WelcomeSVG from '@/assets/svgs/welcome.svg';
import {
  SettingsCard,
  SettingsRow,
  SettingsSection,
  ThemedButton,
  ThemedText,
  ThemedView,
} from '@/components';
import { useAppColorScheme, useColors, useOrientation } from '@/hooks';
import { isWeb } from '@/utils/isWeb';

interface ShareErrorModalProps {
  visible: boolean;
  message: string;
  onClose: () => void;
}

/**
 * Modal shown when a share action fails, with the error message and a close button.
 */
const ShareErrorModal = ({
  visible,
  message,
  onClose,
}: ShareErrorModalProps) => {
  const { cardColor, iconColor, textColor } = useColors();

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={onClose}
        accessibilityLabel="إغلاق نافذة الخطأ"
        accessibilityRole="button"
      >
        <ThemedView
          style={[styles.modalContent, { backgroundColor: cardColor }]}
          onStartShouldSetResponder={() => true}
        >
          <ThemedView
            style={[styles.modalHeader, { borderBottomColor: textColor }]}
          >
            <ThemedText style={[styles.modalTitle, { color: textColor }]}>
              خطأ
            </ThemedText>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="إغلاق رسالة الخطأ"
            >
              <Feather name="x" size={24} color={iconColor} />
            </TouchableOpacity>
          </ThemedView>

          <ThemedText style={[styles.modalMessage, { color: textColor }]}>
            {message}
          </ThemedText>

          <ThemedView style={styles.modalActions}>
            <ThemedButton
              variant="primary"
              onPress={onClose}
              style={styles.modalButton}
            >
              حسناً
            </ThemedButton>
          </ThemedView>
        </ThemedView>
      </TouchableOpacity>
    </Modal>
  );
};

interface MoreRow {
  title: string;
  description: string;
  icon: React.ReactNode;
  onPress: () => void;
}

interface MoreSection {
  title: string;
  icon: keyof typeof Feather.glyphMap;
  rows: MoreRow[];
}

/**
 * More tab landing screen: navigation hub to settings, bookmarks, reminders,
 * tutorial/help, contact, privacy, about, and share.
 */
const MoreScreen = () => {
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const { iconColor, backgroundColor, primaryColor, primaryLightColor } =
    useColors();
  const colorScheme = useAppColorScheme();
  const accentColor = colorScheme === 'dark' ? primaryLightColor : primaryColor;
  const { isLandscape } = useOrientation();
  const insets = useSafeAreaInsets();

  const handleShare = async () => {
    let shareUrl = 'https://www.quran.us.kg';

    if (Platform.OS === 'android') {
      shareUrl =
        'https://play.google.com/store/apps/details?id=com.adelpro.openmushafnative';
    }

    try {
      await Share.share({
        message:
          'شارك هذا التطبيق القرآني مع الآخرين | Open Mushaf Native\n' +
          shareUrl,
        url: shareUrl,
        title: 'Open Mushaf Native',
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'An unexpected error occurred.';
      setErrorMessage(message);
      setErrorModalVisible(true);
    }
  };

  const handleOpenSettings = () => router.push('/settings');

  const handleOpenBookmarks = () => router.push('/bookmarks');

  const handleOpenReminders = () => router.push('/reminders');

  const handleOpenTutorial = () => router.push('/tutorial');

  const handleOpenHelp = async () => {
    const url = 'https://docs.quran.us.kg';
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    }
  };

  const handleOpenContact = () => router.push('/contact');

  const handleOpenPrivacy = () => router.push('/privacy');

  const handleOpenAbout = () => router.push('/about');

  const iconStyle = { color: accentColor };

  const closeErrorModal = () => setErrorModalVisible(false);

  const sections: MoreSection[] = [
    {
      title: 'المحتوى',
      icon: 'book-open',
      rows: [
        {
          title: 'الإعدادات',
          description: 'تخصيص تجربة القراءة والمظهر والتنبيهات',
          icon: <SettingsSVG width={22} height={22} style={iconStyle} />,
          onPress: handleOpenSettings,
        },
        {
          title: 'العلامات المرجعية',
          description: 'عرض وإدارة العلامات المرجعية المحفوظة',
          icon: <BookmarkSVG width={22} height={22} style={iconStyle} />,
          onPress: handleOpenBookmarks,
        },
        ...(isWeb
          ? []
          : [
              {
                title: 'التذكيرات',
                description: 'جدولة تذكيرات القراءة اليومية',
                icon: <Feather name="bell" size={22} color={accentColor} />,
                onPress: handleOpenReminders,
              },
            ]),
      ],
    },
    {
      title: 'الدعم والمساعدة',
      icon: 'help-circle',
      rows: [
        {
          title: 'جولة تعليمية',
          description: 'تعرف على ميزات التطبيق خطوة بخطوة',
          icon: <WelcomeSVG width={22} height={22} style={iconStyle} />,
          onPress: handleOpenTutorial,
        },
        {
          title: 'المساعدة',
          description: 'الأسئلة الشائعة والمساعدة والدعم',
          icon: <HelpSVG width={22} height={22} style={iconStyle} />,
          onPress: handleOpenHelp,
        },
      ],
    },
    {
      title: 'تواصل معنا',
      icon: 'mail',
      rows: [
        {
          title: 'تواصل معنا',
          description: 'راسلنا واقتراحاتك تهمنا',
          icon: <MailSVG width={22} height={22} style={iconStyle} />,
          onPress: handleOpenContact,
        },
      ],
    },
    {
      title: 'حول التطبيق',
      icon: 'info',
      rows: [
        {
          title: 'سياسة الخصوصية',
          description: 'قراءة سياسة الخصوصية للتطبيق',
          icon: <PageSVG width={22} height={22} style={iconStyle} />,
          onPress: handleOpenPrivacy,
        },
        {
          title: 'حول التطبيق',
          description: 'معلومات الإصدار والمطور',
          icon: <InfoSVG width={22} height={22} style={iconStyle} />,
          onPress: handleOpenAbout,
        },
        {
          title: 'شارك التطبيق',
          description: 'شارك التطبيق مع أصدقائك',
          icon: <ShareSVG width={22} height={22} style={iconStyle} />,
          onPress: handleShare,
        },
      ],
    },
  ];

  return (
    <ScrollView
      style={{ backgroundColor }}
      contentContainerStyle={[
        styles.contentContainerStyle,
        {
          paddingTop: isLandscape ? 24 : Math.max(insets.top, 16) + 8,
          paddingBottom: 32,
        },
      ]}
    >
      <ThemedView style={styles.container}>
        <View style={styles.pageHeader}>
          <ThemedText type="title" style={styles.pageTitle}>
            المزيد
          </ThemedText>
          <ThemedText style={[styles.pageSubtitle, { color: iconColor }]}>
            إدارة تفضيلاتك وخيارات التطبيق
          </ThemedText>
        </View>

        {sections.map((section) => (
          <SettingsSection
            key={section.title}
            title={section.title}
            icon={section.icon}
          >
            <SettingsCard>
              {section.rows.map((row) => (
                <SettingsRow
                  key={row.title}
                  options={{ wrapIcon: true, showChevron: true }}
                  title={row.title}
                  description={row.description}
                  icon={row.icon}
                  onPress={row.onPress}
                />
              ))}
            </SettingsCard>
          </SettingsSection>
        ))}

        <ShareErrorModal
          visible={errorModalVisible}
          message={errorMessage}
          onClose={closeErrorModal}
        />
      </ThemedView>
    </ScrollView>
  );
};

export default MoreScreen;

const styles = StyleSheet.create({
  contentContainerStyle: {
    flexGrow: 1,
    paddingHorizontal: 16,
  },
  container: {
    flex: 1,
    width: '100%',
    maxWidth: 640,
    alignSelf: 'center',
    backgroundColor: 'transparent',
  },
  pageHeader: {
    marginBottom: 24,
    gap: 6,
    alignItems: 'center',
  },
  pageTitle: {
    fontSize: 28,
    lineHeight: 40,
    fontFamily: 'Tajawal_700Bold',
    textAlign: 'center',
  },
  pageSubtitle: {
    fontSize: 14,
    lineHeight: 22,
    fontFamily: 'Tajawal_400Regular',
    textAlign: 'center',
  },
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
    justifyContent: 'center',
    backgroundColor: 'transparent',
    width: '100%',
  },
  modalButton: {
    width: '40%',
    maxWidth: 120,
  },
});
