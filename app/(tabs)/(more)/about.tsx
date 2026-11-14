import { ScrollView } from 'react-native-gesture-handler';

import { ExternalLink, Seo, ThemedText, ThemedView } from '@/components';
import { styles } from '@/styles/screens/about.styles';
import { ExternalLinkType } from '@/types';
import { getAppVersion, getBuildVersion } from '@/utils';

export default function AboutScreen() {
  const appVersion = getAppVersion();
  const buildVersion = getBuildVersion();

  const sourcesList: {
    text: string;
    link: ExternalLinkType;
    label: string;
  }[] = [
    {
      text: 'صفحات المصحف من ',
      link: 'https://qurancomplex.gov.sa/techquran/dev/',
      label: 'مجمع الملك فهد لطباعة المصحف الشريف',
    },
    {
      text: 'قاعدة البيانات (JSON)',
      link: 'https://github.com/Zizwar/mushaf-mauri',
      label: 'Zizwar/mushaf-mauri',
    },
    {
      text: 'قاعدة البيانات (JSON)',
      link: 'https://github.com/forabi/aQuran',
      label: 'forabi/aQuran',
    },
    {
      text: 'بيانات التفاسير من ',
      link: 'https://quran.ksu.edu.sa/ayat',
      label: 'آيات',
    },
    {
      text: 'الأيقونة من ',
      link: 'https://iconify.design/',
      label: 'Iconify',
    },
    {
      text: 'صوت تغيير الصفحة',
      link: 'https://pixabay.com',
      label: 'Pixabay',
    },
  ];

  const featuresList = [
    'برواية ورش وحفص.',
    'الوصول إلى المصحف دون اتصال بالإنترنت.',
    'خيارات متعددة للتفسير.',
    'تنقل سلس بين السور والأجزاء.',
    'صور عالية الجودة من مجمع الملك فهد لطباعة المصحف الشريف.',
  ];

  function renderListContainer() {
    return (
      <ThemedView style={styles.listContainer}>
        {sourcesList.map(({ text, link, label }, index) => {
          return (
            <ThemedView style={styles.listItem} key={index} accessible={true}>
              <ThemedText style={styles.bullet}>•</ThemedText>
              <ThemedText style={styles.listText}>
                {text}&nbsp;
                <ExternalLink
                  href={link}
                  style={styles.link}
                  accessible={true}
                  accessibilityLabel={label}
                  accessibilityHint={`فتح الرابط إلى ${label}`}
                >
                  {label}
                </ExternalLink>
              </ThemedText>
            </ThemedView>
          );
        })}
      </ThemedView>
    );
  }

  function renderListContainer2() {
    function renderListItem() {
      return (
        <ThemedView style={styles.listItem}>
          <ThemedText style={styles.bullet}>•</ThemedText>
          <ThemedText style={styles.listText}>
            البرنامج مفتوح المصدر:&nbsp;
            <ExternalLink
              href="https://github.com/adelpro/open-mushaf-native"
              style={styles.link}
              accessible={true}
              accessibilityLabel="Open Mushaf Native repository"
              accessibilityHint="فتح الرابط إلى مستودع Open Mushaf Native"
            >
              open-mushaf-native
            </ExternalLink>
          </ThemedText>
        </ThemedView>
      );
    }
    return (
      <ThemedView style={styles.listContainer}>
        {featuresList.map((feature, index) => {
          return (
            <ThemedView style={styles.listItem} key={index} accessible={true}>
              <ThemedText style={styles.bullet}>•</ThemedText>
              <ThemedText style={styles.listText}>{feature}</ThemedText>
            </ThemedView>
          );
        })}

        {renderListItem()}
      </ThemedView>
    );
  }

  function renderMainContent() {
    return (
      <ThemedView style={styles.mainContent}>
        <ThemedText
          type="title"
          style={styles.title}
          accessible={true}
          accessibilityLabel="المصادر"
        >
          المصادر
        </ThemedText>

        {renderListContainer()}

        <ThemedText
          type="title"
          style={styles.title}
          accessible={true}
          accessibilityLabel="الميزات"
        >
          الميزات
        </ThemedText>

        {renderListContainer2()}

        <ThemedText style={styles.copyright} accessible={true}>
          © {new Date().getFullYear()} Open-Mushaf. جميع الحقوق محفوظة.
        </ThemedText>

        <ThemedText
          style={styles.versionText}
          accessible={true}
          accessibilityLabel={`إصدار التطبيق: ${appVersion} (${buildVersion})`}
        >
          الإصدار: {`${appVersion} (${buildVersion})`}
        </ThemedText>
      </ThemedView>
    );
  }
  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <Seo
        title="المصحف المفتوح - حول التطبيق"
        description="معلومات عن تطبيق المصحف المفتوح - المصادر والميزات"
      />
      {renderMainContent()}
    </ScrollView>
  );
}
