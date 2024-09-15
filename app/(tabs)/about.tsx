import { StyleSheet, TouchableOpacity } from 'react-native';

import { Link } from 'expo-router';
import { useSetRecoilState } from 'recoil';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import TopMenu from '@/components/TopMenu';
import { topMenuState } from '@/recoil/atoms';

export default function AboutScreen() {
  const setShowTopMenu = useSetRecoilState(topMenuState);
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => setShowTopMenu(true)}
    >
      <TopMenu />
      <ThemedView style={styles.mainContent}>
        <ThemedView style={styles.contentBox}>
          <ThemedText style={styles.title}>المصادر</ThemedText>
          <ThemedView style={styles.listContainer}>
            <ThemedView style={styles.listItem}>
              <ThemedText style={styles.bullet}>-</ThemedText>
              <ThemedText style={styles.listText}>
                صفحات المصحف من{' '}
                <Link
                  href="https://qurancomplex.gov.sa/techquran/dev/"
                  style={styles.link}
                >
                  مجمع الملك فهد لطباعة المصحف الشريف
                </Link>
              </ThemedText>
            </ThemedView>
            <ThemedView style={styles.listItem}>
              <ThemedText style={styles.bullet}>-</ThemedText>
              <ThemedText style={styles.listText}>
                قاعدة البيانات (JSON) من{' '}
                <Link
                  href="https://github.com/Zizwar/mushaf-mauri"
                  style={styles.link}
                >
                  Mushaf-mauri
                </Link>
              </ThemedText>
            </ThemedView>
            <ThemedView style={styles.listItem}>
              <ThemedText style={styles.bullet}>-</ThemedText>
              <ThemedText style={styles.listText}>
                بيانات التفاسير من{' '}
                <Link href="https://quran.ksu.edu.sa/ayat" style={styles.link}>
                  آيات
                </Link>
              </ThemedText>
            </ThemedView>
            <ThemedView style={styles.listItem}>
              <ThemedText style={styles.bullet}>-</ThemedText>
              <ThemedText style={styles.listText}>
                الأيقونة من{' '}
                <Link href="https://www.svgrepo.com/" style={styles.link}>
                  SVGRepo
                </Link>
              </ThemedText>
            </ThemedView>
          </ThemedView>

          <ThemedText style={styles.title}>الميزات</ThemedText>

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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#FFFFFF',
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
    borderColor: '#E1E4E8',
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
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
