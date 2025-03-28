import { StyleSheet } from 'react-native';

import * as Application from 'expo-application';
import { Href } from 'expo-router';
import { ScrollView } from 'react-native-gesture-handler';

import { ExternalLink } from '@/components/ExternalLink';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function AboutScreen() {
  const appVersion = Application.nativeApplicationVersion ?? 'Unknown';
  const buildVersion = Application.nativeBuildVersion ?? 'Unknown';
  console.info(`App Version: ${appVersion} (${buildVersion})`);

  const sourcesList: { text: string; link: Href; label: string }[] = [
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

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ThemedView style={styles.mainContent}>
        <ThemedText
          type="title"
          style={styles.title}
          accessible={true}
          accessibilityLabel="المصادر"
        >
          المصادر
        </ThemedText>

        <ThemedView style={styles.listContainer}>
          {sourcesList.map(({ text, link, label }, index) => (
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
          ))}
        </ThemedView>

        <ThemedText
          type="title"
          style={styles.title}
          accessible={true}
          accessibilityLabel="الميزات"
        >
          الميزات
        </ThemedText>

        <ThemedView style={styles.listContainer}>
          {featuresList.map((feature, index) => (
            <ThemedView style={styles.listItem} key={index} accessible={true}>
              <ThemedText style={styles.bullet}>•</ThemedText>
              <ThemedText style={styles.listText}>{feature}</ThemedText>
            </ThemedView>
          ))}

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
        </ThemedView>

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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    maxWidth: 640,
    alignSelf: 'center',
    margin: 2,
  },
  mainContent: {
    flex: 1,
    height: '100%',
    maxWidth: 600,
    paddingHorizontal: 22,
    alignSelf: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginVertical: 5,
  },
  listContainer: {
    marginBottom: 5,
    paddingLeft: 16,
  },
  listItem: {
    marginBottom: 10,
    flexDirection: 'row',
  },
  bullet: {
    marginRight: 10,
    marginLeft: 5,
    fontWeight: '500',
  },
  listText: {
    fontSize: 16,
    lineHeight: 22,
  },
  link: {
    color: '#1E90FF',
    textDecorationLine: 'underline',
  },
  versionText: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
    marginTop: 5,
  },
  copyright: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
    marginTop: 10,
  },
});
