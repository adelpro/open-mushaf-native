import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';

import { Feather } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import { useRecoilState } from 'recoil';

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
  lastDailyReset,
  yesterdayPage,
} from '@/recoil/atoms';
import {
  calculateHizbFromPages,
  updateHizbProgressFromPage,
} from '@/utils/hizbProgress';

export default function TrackerScreen() {
  const { iconColor, cardColor, primaryColor } = useColors();
  const { currentSavedPage: savedPage } = useCurrentPage();

  // Helper function for proper Arabic pluralization of hizb
  const getHizbText = (count: number) => {
    if (count === 0) return '0 أحزاب';
    if (count === 1) return 'حزب واحد';
    if (count === 2) return 'حزبين';
    if (count >= 3 && count <= 10) return `${count} أحزاب`;
    return `${count} حزباً`;
  };

  // Recoil states for tracking progress
  const [dailyHizbGoal, setDailyHizbGoal] = useRecoilState(dailyHizbTarget);
  const [dailyHizbCompleted, setDailyHizbCompleted] =
    useRecoilState(dailyHizbProgress);
  const [lastReset, setLastReset] = useRecoilState(lastDailyReset);
  const [prevPage, setPrevPage] = useRecoilState(yesterdayPage);

  // Temporary placeholder for monthly values (will implement properly in next step)
  const [monthlyHizbGoal] = useState(60); // Full Quran
  const [monthlyHizbCompleted, setMonthlyHizbCompleted] = useState(0);

  // Calculate progress percentages
  const dailyProgress =
    dailyHizbGoal > 0
      ? Math.min(100, (dailyHizbCompleted / dailyHizbGoal) * 100)
      : 0;

  const monthlyProgress =
    monthlyHizbGoal > 0
      ? Math.min(100, (monthlyHizbCompleted / monthlyHizbGoal) * 100)
      : 0;

  // Check for day change and reset daily progress if needed
  useEffect(() => {
    const checkDayChange = () => {
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0]; // YYYY-MM-DD format

      // If this is the first time or a new day
      if (!lastReset || lastReset !== todayStr) {
        // Save yesterday's page before resetting
        if (savedPage > 0) {
          setPrevPage(savedPage);
        }

        // Reset daily progress
        setDailyHizbCompleted(0);

        // Update last reset date
        setLastReset(todayStr);
      }
    };

    checkDayChange();

    // Set up interval to check for day change (every 5 minutes)
    const intervalId = setInterval(checkDayChange, 5 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, [lastReset, savedPage, setDailyHizbCompleted, setLastReset, setPrevPage]);

  useEffect(() => {
    if (savedPage > 0) {
      // Automatically update daily progress when page changes
      if (prevPage > 0 && savedPage > prevPage) {
        // Calculate hizb progress based on page difference
        const hizbProgress = calculateHizbFromPages(prevPage, savedPage);
        setDailyHizbCompleted((prev) =>
          Math.min(prev + hizbProgress, dailyHizbGoal),
        );
      } else {
        // If no previous page, just update based on current page
        updateHizbProgressFromPage(
          savedPage,
          setDailyHizbCompleted,
          dailyHizbGoal,
        );
      }
    }
  }, [savedPage, prevPage, dailyHizbGoal, setDailyHizbCompleted]);

  // Force re-calculation of progress when goal changes
  useEffect(() => {
    if (savedPage > 0) {
      updateHizbProgressFromPage(
        savedPage,
        setDailyHizbCompleted,
        dailyHizbGoal,
      );
    }
  }, [dailyHizbGoal, savedPage, setDailyHizbCompleted]);

  // Handlers for adjusting goals and progress
  const incrementDailyGoal = () => setDailyHizbGoal((prev) => prev + 1);
  const decrementDailyGoal = () =>
    setDailyHizbGoal((prev) => Math.max(1, prev - 1));

  // Reset progress handlers
  const resetDailyProgress = () => {
    Alert.alert(
      'إعادة تعيين التقدم اليومي',
      'هل أنت متأكد من رغبتك في إعادة تعيين تقدم الورد اليومي؟',
      [
        { text: 'إلغاء', style: 'cancel' },
        { text: 'تأكيد', onPress: () => setDailyHizbCompleted(0) },
      ],
    );
  };

  // Temporary placeholder for monthly reset (will implement properly in step 3)
  const resetMonthlyProgress = () => {
    Alert.alert(
      'إعادة تعيين التقدم الشهري',
      'هل أنت متأكد من رغبتك في إعادة تعيين تقدم الورد الشهري؟',
      [
        { text: 'إلغاء', style: 'cancel' },
        { text: 'تأكيد', onPress: () => setMonthlyHizbCompleted(0) },
      ],
    );
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
          {/* Daily Reading Card */}
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
                accessibilityLabel="Daily reading icon"
              />
              <ThemedText
                style={styles.label}
                accessibilityLabel="Daily reading progress"
                accessibilityRole="header"
              >
                الورد اليومي:
              </ThemedText>
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

            {/* Add info about yesterday's page */}
            {prevPage > 0 && (
              <ThemedText style={[styles.infoText, { fontSize: 14 }]}>
                آخر صفحة من الأمس: {prevPage}
              </ThemedText>
            )}

            {/* Controls for daily progress */}
            <ThemedView style={styles.controlsContainer}>
              <ThemedView style={styles.controlGroup}>
                <ThemedText style={styles.controlLabel}>الهدف:</ThemedText>
                <ThemedView style={styles.controls}>
                  <TouchableOpacity
                    style={styles.controlButton}
                    onPress={decrementDailyGoal}
                    accessibilityLabel="تقليل الهدف اليومي"
                  >
                    <Feather name="minus" size={20} color={primaryColor} />
                  </TouchableOpacity>
                  <ThemedText style={styles.controlValue}>
                    {dailyHizbGoal}
                  </ThemedText>
                  <TouchableOpacity
                    style={styles.controlButton}
                    onPress={incrementDailyGoal}
                    accessibilityLabel="زيادة الهدف اليومي"
                  >
                    <Feather name="plus" size={20} color={primaryColor} />
                  </TouchableOpacity>
                </ThemedView>
              </ThemedView>
            </ThemedView>
          </ThemedView>

          {/* Monthly Reading Card */}
          <ThemedView
            style={[styles.navigationSection, { backgroundColor: cardColor }]}
          >
            <ThemedView
              style={[styles.labelContainer, { backgroundColor: cardColor }]}
            >
              <Feather
                name="calendar"
                size={24}
                color={iconColor}
                style={[styles.icon, { color: primaryColor }]}
                accessibilityLabel="Monthly reading icon"
              />
              <ThemedText
                style={styles.label}
                accessibilityLabel="Monthly reading progress"
                accessibilityRole="header"
              >
                الورد الشهري:
              </ThemedText>
            </ThemedView>

            <ThemedView style={styles.progressContainer}>
              <ThemedView
                style={[
                  styles.progressBar,
                  {
                    width: `${monthlyProgress}%`,
                    backgroundColor: primaryColor,
                  },
                ]}
              />
              <ThemedText
                style={[
                  styles.progressText,
                  { color: monthlyProgress > 50 ? 'white' : 'black' },
                ]}
              >
                {monthlyProgress.toFixed(0)}%
              </ThemedText>
            </ThemedView>

            <ThemedText style={styles.infoText}>
              قراءة {getHizbText(monthlyHizbCompleted)} من أصل{' '}
              {getHizbText(monthlyHizbGoal)}
            </ThemedText>

            {/* Monthly progress control removed - will be automatic */}
          </ThemedView>

          {/* Information Card */}
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
                accessibilityLabel="Information icon"
              />
              <ThemedText
                style={styles.label}
                accessibilityLabel="About Hizb tracking"
                accessibilityRole="header"
              >
                عن نظام الأحزاب:
              </ThemedText>
            </ThemedView>

            <ThemedText style={styles.infoText}>
              القرآن الكريم مقسم إلى 60 حزباً، كل جزء يحتوي على حزبين.
            </ThemedText>
            <ThemedText style={styles.infoText}>
              يمكنك تتبع قراءتك اليومية والشهرية بالأحزاب بدلاً من الصفحات، مما
              يساعدك على تنظيم وردك بشكل أفضل.
            </ThemedText>
            <ThemedText style={[styles.infoText, { color: primaryColor }]}>
              يتم حساب تقدم قراءة الأحزاب تلقائياً بناءً على آخر صفحة قمت بحفظها
              (صفحة {savedPage}).
            </ThemedText>

            <ThemedView style={styles.resetButtonsContainer}>
              <ThemedButton
                variant="outlined-primary"
                style={styles.resetButton}
                onPress={resetDailyProgress}
                accessibilityLabel="إعادة تعيين التقدم اليومي"
              >
                إعادة تعيين الورد اليومي
              </ThemedButton>

              <ThemedButton
                variant="outlined-primary"
                style={styles.resetButton}
                onPress={resetMonthlyProgress}
                accessibilityLabel="إعادة تعيين التقدم الشهري"
              >
                إعادة تعيين الورد الشهري
              </ThemedButton>
            </ThemedView>
          </ThemedView>
        </ScrollView>
      </ThemedSafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    width: '100%',
  },
  scrollContent: {
    alignItems: 'center',
    paddingBottom: 20,
  },
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
  navigationSection: {
    marginVertical: 15,
    borderRadius: 10,
    padding: 15,
    width: '100%',
    elevation: 3,
    maxWidth: 640,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginBottom: 15,
  },
  label: {
    fontSize: 20,
    fontFamily: 'Tajawal_700Bold',
    textAlign: 'right',
  },
  icon: {
    marginHorizontal: 5,
  },
  progressContainer: {
    height: 25,
    backgroundColor: '#e0e0e0',
    borderRadius: 12.5,
    overflow: 'hidden',
    position: 'relative',
    marginVertical: 10,
  },
  progressBar: {
    height: '100%',
    position: 'absolute',
    left: 0,
    top: 0,
    borderRadius: 12.5,
  },
  progressText: {
    position: 'absolute',
    width: '100%',
    textAlign: 'center',
    lineHeight: 25,
    fontSize: 14,
    fontFamily: 'Tajawal_700Bold',
  },
  infoText: {
    marginTop: 10,
    fontSize: 16,
    fontFamily: 'Tajawal_400Regular',
    textAlign: 'center',
  },
  controlsContainer: {
    marginTop: 15,
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  controlGroup: {
    alignItems: 'center',
  },
  controlLabel: {
    fontSize: 14,
    fontFamily: 'Tajawal_700Bold',
    marginBottom: 5,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#ccc',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 10,
  },
  controlValue: {
    fontSize: 16,
    fontFamily: 'Tajawal_700Bold',
    minWidth: 30,
    textAlign: 'center',
  },
  resetButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'transparent',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: 20,
    width: '100%',
    gap: 10,
  },
  resetButton: {
    minWidth: 140,
    marginVertical: 5,
  },
});
