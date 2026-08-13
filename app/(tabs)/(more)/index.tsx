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

export default function MoreScreen() {
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const {
    cardColor,
    iconColor,
    textColor,
    backgroundColor,
    primaryColor,
    primaryLightColor,
  } = useColors();
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

  const iconStyle = { color: accentColor };

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

        <SettingsSection title="المحتوى" icon="book-open">
          <SettingsCard>
            <SettingsRow
              wrapIcon
              showChevron
              title="الإعدادات"
              description="تخصيص تجربة القراءة والمظهر والتنبيهات"
              icon={<SettingsSVG width={22} height={22} style={iconStyle} />}
              onPress={() => router.push('/settings')}
            />
            <SettingsRow
              wrapIcon
              showChevron
              title="العلامات المرجعية"
              description="عرض وإدارة العلامات المرجعية المحفوظة"
              icon={<BookmarkSVG width={22} height={22} style={iconStyle} />}
              onPress={() => router.push('/bookmarks')}
            />
            {!isWeb ? (
              <SettingsRow
                wrapIcon
                showChevron
                title="التذكيرات"
                description="جدولة تذكيرات القراءة اليومية"
                icon={<Feather name="bell" size={22} color={accentColor} />}
                onPress={() => router.push('/reminders')}
              />
            ) : null}
          </SettingsCard>
        </SettingsSection>

        <SettingsSection title="الدعم والمساعدة" icon="help-circle">
          <SettingsCard>
            <SettingsRow
              wrapIcon
              showChevron
              title="جولة تعليمية"
              description="تعرف على ميزات التطبيق خطوة بخطوة"
              icon={<WelcomeSVG width={22} height={22} style={iconStyle} />}
              onPress={() => router.push('/tutorial')}
            />
            <SettingsRow
              wrapIcon
              showChevron
              title="المساعدة"
              description="الأسئلة الشائعة والمساعدة والدعم"
              icon={<HelpSVG width={22} height={22} style={iconStyle} />}
              onPress={async () => {
                const url = 'https://docs.quran.us.kg';
                const supported = await Linking.canOpenURL(url);
                if (supported) {
                  await Linking.openURL(url);
                }
              }}
            />
          </SettingsCard>
        </SettingsSection>

        <SettingsSection title="تواصل معنا" icon="mail">
          <SettingsCard>
            <SettingsRow
              wrapIcon
              showChevron
              title="تواصل معنا"
              description="راسلنا واقتراحاتك تهمنا"
              icon={<MailSVG width={22} height={22} style={iconStyle} />}
              onPress={() => router.push('/contact')}
            />
          </SettingsCard>
        </SettingsSection>

        <SettingsSection title="حول التطبيق" icon="info">
          <SettingsCard>
            <SettingsRow
              wrapIcon
              showChevron
              title="سياسة الخصوصية"
              description="قراءة سياسة الخصوصية للتطبيق"
              icon={<PageSVG width={22} height={22} style={iconStyle} />}
              onPress={() => router.push('/privacy')}
            />
            <SettingsRow
              wrapIcon
              showChevron
              title="حول التطبيق"
              description="معلومات الإصدار والمطور"
              icon={<InfoSVG width={22} height={22} style={iconStyle} />}
              onPress={() => router.push('/about')}
            />
            <SettingsRow
              wrapIcon
              showChevron
              title="شارك التطبيق"
              description="شارك التطبيق مع أصدقائك"
              icon={<ShareSVG width={22} height={22} style={iconStyle} />}
              onPress={handleShare}
            />
          </SettingsCard>
        </SettingsSection>

        <Modal
          animationType="fade"
          transparent={true}
          visible={errorModalVisible}
          onRequestClose={() => {
            setErrorModalVisible(false);
          }}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => {
              setErrorModalVisible(false);
            }}
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
                  onPress={() => {
                    setErrorModalVisible(false);
                  }}
                  accessibilityRole="button"
                  accessibilityLabel="إغلاق رسالة الخطأ"
                >
                  <Feather name="x" size={24} color={iconColor} />
                </TouchableOpacity>
              </ThemedView>

              <ThemedText style={[styles.modalMessage, { color: textColor }]}>
                {errorMessage}
              </ThemedText>

              <ThemedView style={styles.modalActions}>
                <ThemedButton
                  variant="primary"
                  onPress={() => {
                    setErrorModalVisible(false);
                  }}
                  style={styles.modalButton}
                >
                  حسناً
                </ThemedButton>
              </ThemedView>
            </ThemedView>
          </TouchableOpacity>
        </Modal>
      </ThemedView>
    </ScrollView>
  );
}

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
