import { useEffect, useMemo, useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { usePathname, useRouter } from 'expo-router';
import { useAtomValue, useSetAtom } from 'jotai/react';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  FadeInLeft,
  FadeInRight,
  FadeOutLeft,
  FadeOutRight,
  runOnJS,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import CheckedSVG from '@/assets/svgs/checked.svg';
import NextSVG from '@/assets/svgs/next.svg';
import { ThemedAppButton } from '@/components/ThemedAppButton';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { fontNames, PAN_GESTURE_CONFIG, SLIDES } from '@/constants';
import { useColors, useOrientation } from '@/hooks';
import { finishedTutorial, panGestureSensitivity } from '@/jotai/atoms';
import { isRTL } from '@/utils';

/**
 * An interactive, paginated onboarding tutorial shown on initial app load.
 * Supports swiping gestures via `react-native-gesture-handler` and localized textual elements.
 *
 * @returns An `Animated.View` containing swipe controls and feature outlines.
 */
export function TutorialGuide() {
  const router = useRouter();
  const pathname = usePathname();
  const { primaryColor, primaryLightColor, backgroundColor } = useColors();
  const setFinishedTutorial = useSetAtom(finishedTutorial);
  const { isLandscape } = useOrientation();
  const panGestureSensitivityValue = useAtomValue(panGestureSensitivity);
  const [index, setIndex] = useState(0);
  const [isPrevDisabled, setIsPrevDisabled] = useState(false);

  const currentSlide = SLIDES[Math.max(0, Math.min(index, SLIDES.length - 1))];
  const isEndNotReached = index < SLIDES.length - 1;
  const nextButtonStyle = { flex: 1, gap: isEndNotReached ? 0 : 5 };
  const nextButtonTitle = isEndNotReached ? 'التالى' : 'إنتهاء';
  const nextButtonIcon = isEndNotReached ? NextSVG : CheckedSVG;

  useEffect(() => {
    setIsPrevDisabled(index === 0);
  }, [index]);

  const finishTutorial = () => {
    setFinishedTutorial(true);
    if (pathname !== '/') {
      router.replace('/');
    }
  };

  const handlePrev = () => {
    setIndex((prev) => (prev > 0 ? prev - 1 : prev));
  };

  const handleNext = () => {
    setIndex((prev) => (prev < SLIDES.length - 1 ? prev + 1 : prev));
  };

  const gestureHandler = useMemo(() => {
    return Gesture.Pan()
      .activeOffsetX(PAN_GESTURE_CONFIG.ACTIVATION_OFFSET_X)
      .failOffsetY(PAN_GESTURE_CONFIG.FAIL_OFFSET_Y)
      .onEnd((e) => {
        const baseThreshold = isLandscape
          ? PAN_GESTURE_CONFIG.LANDSCAPE_THRESHOLD
          : PAN_GESTURE_CONFIG.PORTRAIT_THRESHOLD;

        const threshold = baseThreshold / panGestureSensitivityValue;

        if (Math.abs(e.translationX) > threshold) {
          if (e.translationX < 0) {
            runOnJS(handlePrev)();
          } else {
            runOnJS(handleNext)();
          }
        }
      });
  }, [isLandscape, panGestureSensitivityValue]);

  const nextButtonPressAction = isEndNotReached ? handleNext : finishTutorial;

  return (
    <GestureDetector gesture={gestureHandler}>
      <Animated.View
        entering={isRTL ? FadeInLeft.duration(500) : FadeInRight.duration(500)}
        exiting={isRTL ? FadeOutRight.duration(500) : FadeOutLeft.duration(500)}
        style={styles.animatedContainer}
      >
        <ThemedView style={styles.mainContainer}>
          <SafeAreaView
            style={[styles.safeArea, { backgroundColor }]}
            edges={['top']}
          >
            <ScrollView>
              <ThemedView style={styles.ScrollContent}>
                <Image
                  source={currentSlide.image}
                  style={styles.image}
                  resizeMode="contain"
                />

                <View style={styles.textContainer}>
                  <ThemedText style={styles.title}>
                    {currentSlide.title}
                  </ThemedText>
                  {Array.isArray(currentSlide.description) ? (
                    currentSlide.description.map((item, i) => (
                      <ThemedText
                        key={i}
                        style={[
                          styles.description,
                          item.align !== 'start' && { textAlign: 'center' },
                        ]}
                      >
                        {item.align === 'start' ? '✓ ' : ''}
                        {item.text}
                      </ThemedText>
                    ))
                  ) : (
                    <ThemedText
                      style={[styles.description, { textAlign: 'center' }]}
                    >
                      {currentSlide.description}
                    </ThemedText>
                  )}
                </View>
              </ThemedView>
            </ScrollView>

            <ThemedView style={styles.controlsContainer}>
              <View style={styles.dotsContainer}>
                {SLIDES.map((_, i) => (
                  <View
                    key={i}
                    style={[
                      styles.dot,
                      i === index && styles.activeDot,
                      i === index && { backgroundColor: primaryColor },
                    ]}
                  />
                ))}
              </View>
              <View style={styles.actionButtonsContainer}>
                <ThemedAppButton
                  style={styles.prevButton}
                  variant="outlined-primary"
                  icon={NextSVG}
                  disabled={isPrevDisabled}
                  onPress={handlePrev}
                />
                <ThemedAppButton
                  style={nextButtonStyle}
                  variant="primary"
                  title={nextButtonTitle}
                  icon={nextButtonIcon}
                  onPress={nextButtonPressAction}
                />
              </View>

              <Pressable
                style={styles.closeButtonContainer}
                onPress={finishTutorial}
              >
                <Text
                  style={[styles.closeButtonText, { color: primaryLightColor }]}
                  suppressHighlighting
                  onPress={finishTutorial}
                >
                  تخطي
                </Text>
              </Pressable>
            </ThemedView>
          </SafeAreaView>
        </ThemedView>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  animatedContainer: {
    flex: 1,
    alignItems: 'center',
    margin: 'auto',
    width: '100%',
    maxWidth: 640,
  },
  closeButtonContainer: {
    marginTop: 17,
  },
  closeButtonText: {
    fontFamily: fontNames.regular,
    fontSize: 16,
  },
  safeArea: {
    width: '100%',
    height: '100%',
  },
  mainContainer: {
    flex: 1,
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  image: {
    width: '100%',
    height: 300,
    marginBottom: 10,
    alignSelf: 'center',
  },
  textContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginVertical: 10,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Tajawal_700Bold',
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    lineHeight: 36,
  },
  description: {
    fontSize: 16,
    paddingHorizontal: 10,
    width: '95%',
    marginBottom: 10,
    fontFamily: 'Tajawal_400Regular',
  },
  controlsContainer: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 15,
    marginBottom: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
    paddingHorizontal: 20,
  },
  dotsContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    flexDirection: 'row',
  },
  ScrollContent: {},
  dot: {
    width: 5,
    height: 5,
    borderRadius: 4,
    marginHorizontal: 5,
    backgroundColor: '#E0E0E0',
  },
  activeDot: {
    width: 20,
    height: 8,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    gap: 15,
    width: '100%',
  },
  prevButton: {
    transform: [{ rotate: '-180deg' }],
    width: 60,
  },
});
