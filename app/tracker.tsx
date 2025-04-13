import React, { useEffect } from 'react';
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
} from 'react-native';

import { Feather } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import { useRecoilState } from 'recoil';

// Replace hizbJson with thumnJson for more granular tracking
import thumnJson from '@/assets/quran-metadata/mushaf-elmadina-hafs-assim/thumn.json';
import SEO from '@/components/seo';
import { ThemedButton } from '@/components/ThemedButton';
import { ThemedSafeAreaView } from '@/components/ThemedSafeAreaView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useColors } from '@/hooks/useColors';
import useCurrentPage from '@/hooks/useCurrentPage';
import {
  dailyHizbProgress,
  dailyHizbTarget,
  yesterdayPage,
} from '@/recoil/atoms';
// Update the type import to include Thumn
import { Thumn } from '@/types';
// Update the utility function import or create a new one for thumn calculation
import { calculateThumnsBetweenPages } from '@/utils/hizbProgress';

export default function TrackerScreen() {
  const { iconColor, cardColor, primaryColor } = useColors();
  const { currentSavedPage: savedPage } = useCurrentPage();

  const [dailyHizbGoal, setDailyHizbGoal] = useRecoilState(dailyHizbTarget);
  const [dailyHizbCompleted, setDailyHizbCompleted] =
    useRecoilState(dailyHizbProgress);
  const [yesterdayPageValue, setYesterdayPageValue] =
    useRecoilState(yesterdayPage);

  // Update to use thumn data
  const thumnData = thumnJson as Thumn[];

  // Should be converted to hizb units first
  const dailyProgress =
    dailyHizbGoal > 0
      ? Math.min(100, (dailyHizbCompleted / 8 / (dailyHizbGoal / 8)) * 100)
      : 0;

  // Ensure goal is always in full hizb units
  useEffect(() => {
    if (dailyHizbGoal % 8 !== 0) {
      setDailyHizbGoal(Math.ceil(dailyHizbGoal / 8) * 8);
    }
  }, [dailyHizbGoal, setDailyHizbGoal]);

  // Save current page to yesterdayPage at midnight and reset
  useEffect(() => {
    const now = new Date();
    const msUntilMidnight =
      new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).getTime() -
      now.getTime();

    const timeout = setTimeout(() => {
      if (typeof savedPage === 'number' && savedPage > 0) {
        setYesterdayPageValue(savedPage);
      }
      setDailyHizbCompleted(0);
      setYesterdayPageValue(savedPage);
    }, msUntilMidnight);

    return () => clearTimeout(timeout);
  }, [setDailyHizbCompleted, setYesterdayPageValue, savedPage]);

  // Should change by full hizb (8 thumns)
  const incrementDailyGoal = () => setDailyHizbGoal((prev) => prev + 8);
  const decrementDailyGoal = () =>
    setDailyHizbGoal((prev) => Math.max(8, prev - 8));

  const resetAllProgress = () => {
    const performReset = () => {
      if (typeof savedPage === 'number' && savedPage > 0) {
        setYesterdayPageValue(savedPage);
      }

      setDailyHizbCompleted(0);
    };

    if (Platform.OS === 'web') {
      const confirmed = window.confirm(
        'هل أنت متأكد من رغبتك في إعادة تعيين التقدم؟',
      );
      if (confirmed) performReset();
    } else {
      Alert.alert(
        'إعادة تعيين',
        'هل أنت متأكد من رغبتك في إعادة تعيين التقدم؟',
        [
          { text: 'إلغاء', style: 'cancel' },
          {
            text: 'تأكيد',
            onPress: performReset,
          },
        ],
      );
    }
  };

  useEffect(() => {
    if (typeof savedPage === 'number' && savedPage > 0) {
      // Update to use thumn calculation instead of hizb
      const numberOfThumn = calculateThumnsBetweenPages(
        yesterdayPageValue,
        savedPage,
        thumnData,
      );

      setDailyHizbCompleted(numberOfThumn);
    }
  }, [thumnData, savedPage, setDailyHizbCompleted, yesterdayPageValue]);

  const getHizbText = (count: number) => {
    const hizbCount = Math.floor(count / 8);

    if (hizbCount === 0) return '0 أحزاب';
    if (hizbCount === 1) return 'حزب واحد';
    if (hizbCount === 2) return 'حزبين';
    if (hizbCount >= 3 && hizbCount <= 10) return `${hizbCount} أحزاب`;
    return `${hizbCount} حزباً`;
  };

  return (
    <>
      <Stack.Screen options={{ title: 'الورد' }} />
      <SEO title="الورد - المصحف المفتوح" description="الورد في تطبيق المصحف" />
      <ThemedSafeAreaView style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
        >
          <ThemedView
            style={[styles.navigationSection, { backgroundColor: cardColor }]}
          >
            <ThemedView
              style={[styles.labelContainer, { backgroundColor: cardColor }]}
            >
              <Feather
                name="book-open"
                size={24}
                color={iconColor}
                style={[styles.icon, { color: primaryColor }]}
              />
              <ThemedText style={styles.label}>الورد اليومي:</ThemedText>
            </ThemedView>

            <ThemedView style={styles.progressContainer}>
              <ThemedView
                style={[
                  styles.progressBar,
                  { width: `${dailyProgress}%`, backgroundColor: primaryColor },
                ]}
              />
              <ThemedText
                style={[
                  styles.progressText,
                  { color: dailyProgress > 50 ? 'white' : 'black' },
                ]}
              >
                {dailyProgress.toFixed(0)}%
              </ThemedText>
            </ThemedView>

            <ThemedText style={styles.infoText}>
              قراءة {getHizbText(dailyHizbCompleted)} من أصل{' '}
              {getHizbText(dailyHizbGoal)}
            </ThemedText>

            {yesterdayPageValue > 0 && (
              <ThemedText style={[styles.infoText, { fontSize: 14 }]}>
                آخر صفحة من الأمس: {yesterdayPageValue}
              </ThemedText>
            )}

            <ThemedView style={styles.controlsContainer}>
              <ThemedView style={styles.controlGroup}>
                <ThemedText style={styles.controlLabel}>
                  الهدف اليومي:
                </ThemedText>
                <ThemedView style={styles.controls}>
                  <TouchableOpacity
                    style={styles.controlButton}
                    onPress={decrementDailyGoal}
                  >
                    <Feather name="minus" size={20} color={primaryColor} />
                  </TouchableOpacity>
                  <ThemedText style={styles.controlValue}>
                    {getHizbText(dailyHizbGoal)}
                  </ThemedText>
                  <TouchableOpacity
                    style={styles.controlButton}
                    onPress={incrementDailyGoal}
                  >
                    <Feather name="plus" size={20} color={primaryColor} />
                  </TouchableOpacity>
                </ThemedView>
              </ThemedView>
            </ThemedView>
          </ThemedView>

          <ThemedView
            style={[styles.navigationSection, { backgroundColor: cardColor }]}
          >
            <ThemedView
              style={[styles.labelContainer, { backgroundColor: cardColor }]}
            >
              <Feather
                name="info"
                size={24}
                color={iconColor}
                style={[styles.icon, { color: primaryColor }]}
              />
              <ThemedText style={styles.label}>عن تقسيم القرآن:</ThemedText>
            </ThemedView>

            <ThemedText style={styles.infoText}>
              القرآن الكريم مقسم إلى 60 حزباً لتسهيل القراءة والمراجعة.
            </ThemedText>

            <ThemedText style={[styles.infoText, { color: primaryColor }]}>
              يُحسب الورد الْيَوْمِيُّ من خلال مقارنة الصفحة الحالية (صفحة{' '}
              {typeof savedPage === 'number' ? savedPage : 'غير محددة'}) بآخر
              صفحة قرأتها بالأمس، وتحديد عدد الأحزاب المقروءة.
            </ThemedText>

            <ThemedView style={styles.resetButtonsContainer}>
              <ThemedButton
                variant="outlined-primary"
                style={styles.resetButton}
                onPress={resetAllProgress}
              >
                <ThemedView
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: 'transparent',
                    justifyContent: 'center',
                    gap: 5,
                  }}
                >
                  <Feather name="refresh-cw" size={16} color={primaryColor} />
                  <Text
                    style={{
                      color: primaryColor,
                      fontFamily: 'Tajawal_400Regular',
                      fontSize: 18,
                    }}
                  >
                    إعادة التعيين
                  </Text>
                </ThemedView>
              </ThemedButton>
            </ThemedView>
          </ThemedView>
        </ScrollView>
      </ThemedSafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    margin: 2,
    alignItems: 'center',
    justifyContent: 'flex-start',
    alignSelf: 'center',
    width: '100%',
    maxWidth: 640,
  },
  scrollView: { width: '100%' },
  scrollContent: { alignItems: 'center', paddingBottom: 40 },
  navigationSection: {
    width: '90%',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 12,
  },
  icon: { marginEnd: 10 },
  label: { fontSize: 18, fontWeight: 'bold' },
  progressContainer: {
    height: 24,
    width: '100%',
    borderRadius: 12,
    backgroundColor: '#E5E7EB',
    overflow: 'hidden',
    justifyContent: 'center',
    marginBottom: 8,
  },
  progressBar: {
    position: 'absolute',
    height: '100%',
    left: 0,
    borderRadius: 12,
  },
  progressText: {
    width: '100%',
    textAlign: 'center',
    fontSize: 12,
    zIndex: 1,
  },
  infoText: { marginTop: 4, fontSize: 16, lineHeight: 24 },
  controlsContainer: {
    marginTop: 12,
    alignItems: 'center',
  },
  controlGroup: { flexDirection: 'row', alignItems: 'center' },
  controlLabel: { marginEnd: 8, fontSize: 16 },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 5,
  },
  controlButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 10,
  },
  controlValue: {
    fontSize: 16,
    fontFamily: 'Tajawal_700Bold',
    minWidth: 60,
    textAlign: 'center',
  },
  resetButtonsContainer: {
    marginTop: 20,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  resetButton: { paddingHorizontal: 16, paddingVertical: 8 }, // This padding controls the space around the icon and text
});
