import React, { useState } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import BookmarkSVG from '@/assets/svgs/bookmark.svg';
import DownloadSVG from '@/assets/svgs/download.svg';
import HelpSVG from '@/assets/svgs/help.svg';
import InfoSVG from '@/assets/svgs/info.svg';
import MailSVG from '@/assets/svgs/mail.svg';
import PageSVG from '@/assets/svgs/page.svg';
import SettingsSVG from '@/assets/svgs/settings.svg';
import ShareSVG from '@/assets/svgs/share.svg';
import WelcomeSVG from '@/assets/svgs/welcome.svg';
import { Seo, ThemedButton, ThemedText, ThemedView } from '@/components';
import { useColors, useOrientation } from '@/hooks';
import { styles } from '@/styles/screens/more.styles';
import { isWeb } from '@/utils/isWeb';

type SectionIconName = 'sliders' | 'book-open' | 'help-circle' | 'share-2';

const MENU_ICON_COLOR = '#FFFFFF';

interface MenuItemConfig {
  key: string;
  title: string;
  subtitle: string;
  accessibilityLabel: string;
  accessibilityHint: string;
  onPress: () => void;
  renderIcon: () => React.ReactNode;
}

interface MenuSectionConfig {
  key: string;
  title: string;
  icon: SectionIconName;
  items: MenuItemConfig[];
}

/**
 * More tab home screen — grouped navigation menu for settings, content,
 * support, and sharing actions.
 *
 * Used as the root route of the `(tabs)/(more)` stack
 * (`app/(tabs)/(more)/index.tsx`).
 */
export default function MoreScreen() {
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const {
    backgroundColor,
    cardColor,
    iconColor,
    primaryColor,
    primaryLightColor,
    textColor,
  } = useColors();
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

  const sections: MenuSectionConfig[] = [
    ...MENU_SECTIONS,
    {
      key: 'share',
      title: 'المشاركة',
      icon: 'share-2',
      items: [
        {
          key: 'share-app',
          title: 'شارك التطبيق',
          subtitle: 'ادعمنا بمشاركة التطبيق مع الآخرين',
          accessibilityLabel: 'شارك التطبيق',
          accessibilityHint: 'افتح قائمة مشاركة التطبيق',
          onPress: () => {
            void handleShare();
          },
          renderIcon: () => {
            return <ShareSVG width={22} height={22} color={MENU_ICON_COLOR} />;
          },
        },
      ],
    },
  ];

  function renderModalOverlay() {
    function renderModalContent() {
      function renderModalHeader() {
        return (
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
        );
      }
      return (
        <ThemedView
          style={[styles.modalContent, { backgroundColor: cardColor }]}
          onStartShouldSetResponder={() => true}
        >
          {renderModalHeader()}

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
      );
    }
    return (
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={() => {
          setErrorModalVisible(false);
        }}
        accessibilityLabel="إغلاق نافذة الخطأ"
        accessibilityRole="button"
      >
        {renderModalContent()}
      </TouchableOpacity>
    );
  }

  function renderScrollView() {
    function renderSections() {
      return (
        <View style={styles.sections}>
          {sections.map((section) => {
            function renderCard() {
              return (
                <ThemedView
                  style={[
                    styles.card,
                    {
                      backgroundColor: cardColor,
                      borderColor: `${iconColor}22`,
                    },
                  ]}
                >
                  {section.items.map((item, index) => {
                    const isLast = index === section.items.length - 1;

                    return (
                      <Pressable
                        key={item.key}
                        onPress={item.onPress}
                        accessibilityRole="button"
                        accessibilityLabel={item.accessibilityLabel}
                        accessibilityHint={item.accessibilityHint}
                        style={({ pressed }) => [
                          styles.row,
                          !isLast && {
                            borderBottomWidth: StyleSheet.hairlineWidth,
                            borderBottomColor: `${iconColor}33`,
                          },
                          pressed && styles.rowPressed,
                        ]}
                      >
                        <View
                          style={[
                            styles.iconBox,
                            { backgroundColor: primaryColor },
                          ]}
                        >
                          {item.renderIcon()}
                        </View>
                        <View style={styles.textColumn}>
                          <ThemedText
                            type="defaultSemiBold"
                            style={[styles.itemTitle, { color: textColor }]}
                          >
                            {item.title}
                          </ThemedText>
                          <ThemedText
                            style={[styles.itemSubtitle, { color: iconColor }]}
                          >
                            {item.subtitle}
                          </ThemedText>
                        </View>
                      </Pressable>
                    );
                  })}
                </ThemedView>
              );
            }
            return (
              <View key={section.key} style={styles.sectionBlock}>
                <View style={styles.sectionHeader}>
                  <Feather
                    name={section.icon}
                    size={18}
                    color={primaryLightColor}
                  />
                  <ThemedText
                    style={[styles.sectionTitle, { color: primaryLightColor }]}
                  >
                    {section.title}
                  </ThemedText>
                </View>

                {renderCard()}
              </View>
            );
          })}
        </View>
      );
    }
    return (
      <ScrollView
        contentContainerStyle={[
          styles.contentContainer,
          {
            paddingTop: isLandscape ? 24 : Math.max(insets.top, 16),
            paddingBottom: 24,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <ThemedText type="title" style={styles.headerTitle}>
            المزيد
          </ThemedText>
          <ThemedText style={[styles.headerSubtitle, { color: iconColor }]}>
            كل ما تحتاجه في مكان واحد
          </ThemedText>
        </View>

        {renderSections()}
      </ScrollView>
    );
  }
  function renderScreenContent() {
    return (
      <ThemedView style={[styles.root, { backgroundColor }]}>
        <Seo
          title="المصحف المفتوح - المزيد"
          description="إعدادات التطبيق والعلامات المرجعية والمساعدة والمزيد"
        />
        {renderScrollView()}

        <Modal
          animationType="fade"
          transparent={true}
          visible={errorModalVisible}
          onRequestClose={() => {
            setErrorModalVisible(false);
          }}
        >
          {renderModalOverlay()}
        </Modal>
      </ThemedView>
    );
  }
  return renderScreenContent();
}

const customizationItems: MenuItemConfig[] = [
  {
    key: 'settings',
    title: 'الإعدادات',
    subtitle: 'تخصيص التطبيق والمظهر والإشعارات',
    accessibilityLabel: 'الإعدادات',
    accessibilityHint: 'انتقل إلى صفحة إعدادات التطبيق',
    onPress: () => {
      router.push('/settings');
    },
    renderIcon: () => {
      return <SettingsSVG width={22} height={22} color={MENU_ICON_COLOR} />;
    },
  },
  {
    key: 'downloads',
    title: 'التنزيلات',
    subtitle: 'إدارة تنزيلات المصحف والتفسير',
    accessibilityLabel: 'التنزيلات',
    accessibilityHint: 'انتقل إلى صفحة إدارة التنزيلات',
    onPress: () => {
      router.push('/downloads');
    },
    renderIcon: () => {
      return <DownloadSVG width={22} height={22} color={MENU_ICON_COLOR} />;
    },
  },
];
if (!isWeb) {
  customizationItems.push({
    key: 'reminders',
    title: 'التذكيرات',
    subtitle: 'جدولة تذكيرات القراءة اليومية',
    accessibilityLabel: 'التذكيرات',
    accessibilityHint: 'انتقل إلى صفحة إدارة التذكيرات',
    onPress: () => {
      router.push('/reminders');
    },
    renderIcon: () => {
      return (
        <MaterialCommunityIcons
          name="bell-outline"
          size={22}
          color={MENU_ICON_COLOR}
        />
      );
    },
  });
}
const openHelpDocs = async () => {
  const url = 'https://docs.quran.us.kg';
  const supported = await Linking.canOpenURL(url);
  if (supported) {
    await Linking.openURL(url);
  }
};
const MENU_SECTIONS: MenuSectionConfig[] = [
  {
    key: 'customization',
    title: 'التخصيص',
    icon: 'sliders',
    items: customizationItems,
  },
  {
    key: 'content',
    title: 'المحتوى',
    icon: 'book-open',
    items: [
      {
        key: 'bookmarks',
        title: 'العلامات المرجعية',
        subtitle: 'عرض وإدارة العلامات المرجعية',
        accessibilityLabel: 'العلامات المرجعية',
        accessibilityHint: 'انتقل إلى صفحة العلامات المرجعية',
        onPress: () => {
          router.push('/bookmarks');
        },
        renderIcon: () => {
          return <BookmarkSVG width={22} height={22} color={MENU_ICON_COLOR} />;
        },
      },
      {
        key: 'tutorial',
        title: 'جولة تعليمية',
        subtitle: 'تعرف على مميزات التطبيق',
        accessibilityLabel: 'جولة تعليمية',
        accessibilityHint: 'ابدأ الجولة التعليمية للتطبيق',
        onPress: () => {
          router.push('/tutorial');
        },
        renderIcon: () => {
          return <WelcomeSVG width={22} height={22} color={MENU_ICON_COLOR} />;
        },
      },
    ],
  },
  {
    key: 'support',
    title: 'الدعم والمعلومات',
    icon: 'help-circle',
    items: [
      {
        key: 'contact',
        title: 'تواصل معنا',
        subtitle: 'راسلنا واقترح أفكارك',
        accessibilityLabel: 'تواصل معنا',
        accessibilityHint: 'انتقل إلى صفحة التواصل',
        onPress: () => {
          router.push('/contact');
        },
        renderIcon: () => {
          return <MailSVG width={22} height={22} color={MENU_ICON_COLOR} />;
        },
      },
      {
        key: 'help',
        title: 'المساعدة',
        subtitle: 'الأسئلة الشائعة والدعم',
        accessibilityLabel: 'المساعدة',
        accessibilityHint: 'افتح وثائق المساعدة في المتصفح',
        onPress: () => {
          void openHelpDocs();
        },
        renderIcon: () => {
          return <HelpSVG width={22} height={22} color={MENU_ICON_COLOR} />;
        },
      },
      {
        key: 'privacy',
        title: 'سياسة الخصوصية',
        subtitle: 'تعرف على كيفية حماية بياناتك',
        accessibilityLabel: 'سياسة الخصوصية',
        accessibilityHint: 'انتقل إلى صفحة سياسة الخصوصية',
        onPress: () => {
          router.push('/privacy');
        },
        renderIcon: () => {
          return <PageSVG width={22} height={22} color={MENU_ICON_COLOR} />;
        },
      },
      {
        key: 'terms',
        title: 'شروط الاستخدام',
        subtitle: 'القواعد والشروط لاستخدام خدماتنا',
        accessibilityLabel: 'شروط الاستخدام',
        accessibilityHint: 'انتقل إلى صفحة شروط الاستخدام',
        onPress: () => {
          router.push('/terms');
        },
        renderIcon: () => {
          return <Feather name="file-text" size={22} color={MENU_ICON_COLOR} />;
        },
      },
      {
        key: 'about',
        title: 'حول التطبيق',
        subtitle: 'الإصدار والمعلومات القانونية',
        accessibilityLabel: 'حول التطبيق',
        accessibilityHint: 'انتقل إلى صفحة حول التطبيق',
        onPress: () => {
          router.push('/about');
        },
        renderIcon: () => {
          return <InfoSVG width={22} height={22} color={MENU_ICON_COLOR} />;
        },
      },
    ],
  },
];
