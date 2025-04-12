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

import hizbJson from '@/assets/quran-metadata/mushaf-elmadina-warsh-azrak/hizb.json';
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
  lastReset,
  yesterdayPage,
} from '@/recoil/atoms';
import { Hizb } from '@/types';
import { calculateHizbsBetweenPages } from '@/utils/hizbProgress';

export default function TrackerScreen() {
  const { iconColor, cardColor, primaryColor } = useColors();
  const { currentSavedPage: savedPage } = useCurrentPage();

  const [dailyHizbGoal, setDailyHizbGoal] = useRecoilState(dailyHizbTarget);
  const [dailyHizbCompleted, setDailyHizbCompleted] =
    useRecoilState(dailyHizbProgress);
  const [lastResetValue, setLastResetValue] = useRecoilState(lastReset);
  const [yesterdayPageValue, setYesterdayPageValue] =
    useRecoilState(yesterdayPage);

  const hizbData = hizbJson as Hizb[];

  const dailyProgress =
    dailyHizbGoal > 0
      ? Math.min(100, (dailyHizbCompleted / dailyHizbGoal) * 100)
      : 0;

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

  const incrementDailyGoal = () => setDailyHizbGoal((prev) => prev + 1);
  const decrementDailyGoal = () =>
    setDailyHizbGoal((prev) => Math.max(1, prev - 1));

  const resetAllProgress = () => {
    const performReset = () => {
      if (typeof savedPage === 'number' && savedPage > 0) {
        setYesterdayPageValue(savedPage);
      }

      setDailyHizbCompleted(0);
      const todayStr = new Date().toISOString().split('T')[0];
      setLastResetValue(todayStr);
      console.log('Manual reset completed', { todayStr });
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
      const numberOfHizb = calculateHizbsBetweenPages(
        yesterdayPageValue,
        savedPage,
        hizbData,
      );

      setDailyHizbCompleted(numberOfHizb);
    }
  }, [hizbData, savedPage, setDailyHizbCompleted, yesterdayPageValue]);

  const getHizbText = (count: number) => {
    if (count === 0) return '0 أحزاب';
    if (count === 1) return 'حزب واحد';
    if (count === 2) return 'حزبين';
    if (count >= 3 && count <= 10) return `${count} أحزاب`;
    return `${count} حزباً`;
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
                {/* Updated Label */}
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
                  {/* Updated Value Display */}
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
              <ThemedText style={styles.label}>عن نظام الأحزاب:</ThemedText>
            </ThemedView>

            <ThemedText style={styles.infoText}>
              القرآن الكريم مقسم إلى 60 حزباً، كل جزء يحتوي على حزبين.
            </ThemedText>
            <ThemedText style={styles.infoText}>
              يمكنك تتبع قراءتك اليومية بالأحزاب بدلاً من الصفحات.
            </ThemedText>
            {/* Updated the informational text for better clarity */}
            <ThemedText style={[styles.infoText, { color: primaryColor }]}>
              يُحسب الورد اليومي عن طريق حساب عدد الأحزاب بين آخر صفحة تمت
              قراءتها بالأمس والصفحة الحالية (صفحة{' '}
              {typeof savedPage === 'number' ? savedPage : 'غير محددة'}).
            </ThemedText>

            <ThemedView style={styles.resetButtonsContainer}>
              <ThemedButton
                variant="outlined-primary"
                style={styles.resetButton}
                onPress={resetAllProgress}
              >
                <ThemedView
                  style={{
                    flexDirection: 'row-reverse',
                    alignItems: 'center',
                    backgroundColor: 'transparent',
                    justifyContent: 'center',
                    padding: 10,
                    gap: 5,
                  }}
                >
                  <Feather
                    name="refresh-cw"
                    size={16}
                    color={primaryColor}
                    style={{ marginRight: 5 }}
                  />
                  <Text
                    style={{
                      color: primaryColor,
                      fontFamily: 'Tajawal_400Regular',
                      fontSize: 18,
                    }}
                  >
                    إعادة تعيين
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
    // Note: Text color logic remains simple for now. Consider dynamic contrast calculation later.
  },
  infoText: { marginTop: 4, fontSize: 16, lineHeight: 24 }, // Added lineHeight for better readability
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
    // borderColor: '#ccc', // Use theme color instead of hardcoded grey
    // Use primaryColor for the border - requires access to it here.
    // Since styles are defined outside the component, we can't directly use primaryColor variable here.
    // Option 1: Pass primaryColor as a prop to this component (complex setup).
    // Option 2: Define styles inline within the component (less performant for frequently changing styles).
    // Option 3: Keep a neutral color or adjust the component structure.
    // For now, keeping a neutral grey, but ideally this would use a theme color.
    borderColor: '#E5E7EB', // Using the progress bar background color for neutrality
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 10,
  },
  controlValue: {
    fontSize: 16,
    fontFamily: 'Tajawal_700Bold',
    minWidth: 60, // Increased minWidth to accommodate longer text like "حزبين"
    textAlign: 'center',
  },
  // Adjusted margin for better spacing consistency
  resetButtonsContainer: {
    marginTop: 20,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  resetButton: { paddingHorizontal: 16, paddingVertical: 8 },
});
