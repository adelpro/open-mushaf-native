import { StyleSheet, TouchableOpacity } from 'react-native';

import { useSetRecoilState } from 'recoil';

import { ExternalLink } from '@/components/ExternalLink';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import TopMenu from '@/components/TopMenu';
import { topMenuState } from '@/recoil/atoms';

export default function AboutScreen() {
  const setShowTopMenu = useSetRecoilState(topMenuState);

  return (
    <ThemedView style={styles.container}>
      <TouchableOpacity
        style={styles.container}
        onPress={() => setShowTopMenu(true)}
      >
        <TopMenu />
        <ThemedView style={styles.mainContent}>
          <ThemedView style={styles.contentBox}>
            <ThemedText type="title" style={styles.title}>
              المصادر
            </ThemedText>
            <ThemedView style={styles.listContainer}>
              <ThemedView style={styles.listItem}>
                <ThemedText style={styles.bullet}>-</ThemedText>
                <ThemedText style={styles.listText}>
                  صفحات المصحف من{' '}
                  <ExternalLink
                    href="https://qurancomplex.gov.sa/techquran/dev/"
                    style={styles.link}
                  >
                    مجمع الملك فهد لطباعة المصحف الشريف
                  </ExternalLink>
                </ThemedText>
              </ThemedView>
              <ThemedView style={styles.listItem}>
                <ThemedText style={styles.bullet}>-</ThemedText>
                <ThemedText style={styles.listText}>
                  قاعدة البيانات (JSON) من{' '}
                  <ExternalLink
                    href="https://github.com/Zizwar/mushaf-mauri"
                    style={styles.link}
                  >
                    Mushaf-mauri
                  </ExternalLink>
                </ThemedText>
              </ThemedView>
              <ThemedView style={styles.listItem}>
                <ThemedText style={styles.bullet}>-</ThemedText>
                <ThemedText style={styles.listText}>
                  بيانات التفاسير من{' '}
                  <ExternalLink
                    href="https://quran.ksu.edu.sa/ayat"
                    style={styles.link}
                  >
                    آيات
                  </ExternalLink>
                </ThemedText>
              </ThemedView>
              <ThemedView style={styles.listItem}>
                <ThemedText style={styles.bullet}>-</ThemedText>
                <ThemedText style={styles.listText}>
                  الأيقونة من{' '}
                  <ExternalLink
                    href="https://www.svgrepo.com/"
                    style={styles.link}
                  >
                    SVGRepo
                  </ExternalLink>
                </ThemedText>
              </ThemedView>
            </ThemedView>

            <ThemedText type="title" style={styles.title}>
              الميزات
            </ThemedText>

            <ThemedView style={styles.listContainer}>
              <ThemedView style={styles.listItem}>
                <ThemedText style={styles.bullet}>-</ThemedText>
                <ThemedText style={styles.listText}>
                  الوصول إلى المصحف دون اتصال بالإنترنت.
                </ThemedText>
              </ThemedView>
              <ThemedView style={styles.listItem}>
                <ThemedText style={styles.bullet}>-</ThemedText>
                <ThemedText style={styles.listText}>
                  خيارات متعددة للتفسير.
                </ThemedText>
              </ThemedView>
              <ThemedView style={styles.listItem}>
                <ThemedText style={styles.bullet}>-</ThemedText>
                <ThemedText style={styles.listText}>
                  تنقل سلس بين السور والأجزاء.
                </ThemedText>
              </ThemedView>
              <ThemedView style={styles.listItem}>
                <ThemedText style={styles.bullet}>-</ThemedText>
                <ThemedText style={styles.listText}>
                  صور عالية الجودة من مجمع الملك فهد لطباعة المصحف الشريف.
                </ThemedText>
              </ThemedView>
            </ThemedView>
          </ThemedView>

          <ThemedText style={styles.copyright}>
            © {new Date().getFullYear()} Open-Mushaf. جميع الحقوق محفوظة.
          </ThemedText>
        </ThemedView>
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    width: '100%',
    height: '100%',
  },
  link: {
    color: '#007AFF',
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
  mainContent: {
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
  },
  contentBox: {
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 16,
    padding: 10,
    paddingLeft: 24,
  },
  listContainer: {
    marginBottom: 20,
    paddingLeft: 24,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  bullet: {
    marginRight: 12,
    fontWeight: '500',
    color: '#6B7280',
    marginLeft: 12,
    fontSize: 20,
  },
  listText: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
  },
  copyright: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 32,
  },
});
