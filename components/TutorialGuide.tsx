import { useEffect, useMemo, useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { useRouter } from 'expo-router';
import { useAtomValue, useSetAtom } from 'jotai/react';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  FadeInLeft,
  FadeInRight,
  FadeOutLeft,
  FadeOutRight,
  runOnJS,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import CheckedSVG from '@/assets/svgs/checked.svg';
import NextSVG from '@/assets/svgs/next.svg';
import { ThemedAppButton } from '@/components/ThemedAppButton';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { fontNames, getPanThreshold, PAN_GESTURE_CONFIG, SLIDES } from '@/constants';
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
  const { top, bottom } = useSafeAreaInsets();
  const router = useRouter();
  const { primaryColor, primaryLightColor, backgroundColor } = useColors();
  const setFinishedTutorial = useSetAtom(finishedTutorial);
  const { isLandscape, width } = useOrientation();
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

    // For OnBoarding
    if (!router.canGoBack()) {
      return router.replace('/');
    }

    router.back();
  };

  const handlePrev = () => {
    setIndex((prev) => (prev > 0 ? prev - 1 : prev));
  };

  const handleNext = () => {
    setIndex((prev) => (prev < SLIDES.length - 1 ? prev + 1 : prev));
  };

  const gestureHandler = useMemo(() => {
    // Computed on the JS thread and captured as a plain number, so the worklet
    // below never calls into a non-worklet function on the UI thread.
    const baseThreshold = getPanThreshold(width, isLandscape);

    return Gesture.Pan()
      .activeOffsetX(PAN_GESTURE_CONFIG.ACTIVATION_OFFSET_X)
      .failOffsetY(PAN_GESTURE_CONFIG.FAIL_OFFSET_Y)
      .onEnd((e) => {
        const threshold = baseThreshold / panGestureSensitivityValue;

        if (Math.abs(e.translationX) > threshold) {
          if (e.translationX < 0) {
            runOnJS(handlePrev)();
          } else {
            runOnJS(handleNext)();
          }
        }
      });
  }, [isLandscape, width, panGestureSensitivityValue]);

  const nextButtonPressAction = isEndNotReached ? handleNext : finishTutorial;

  const handleNavToFeatureDetails = () => {
    router.navigate({
      pathname: '/featureDetails',
      params: { slideId: currentSlide.id },
    });
  };

  const scrollContentCtStyle = useMemo(() => {
    return {
      flexGrow: 1,
      backgroundColor,
      paddingTop: top * 1.3,
      paddingBottom: bottom,
    };
  }, [backgroundColor, top, bottom]);

  return (
    <GestureDetector gesture={gestureHandler}>
      <Animated.View
        entering={isRTL ? FadeInLeft.duration(500) : FadeInRight.duration(500)}
        exiting={isRTL ? FadeOutRight.duration(500) : FadeOutLeft.duration(500)}
        style={styles.animatedContainer}
      >
        <ScrollView
          style={styles.safeArea}
          contentContainerStyle={scrollContentCtStyle}
        >
          <Image
            source={currentSlide.image}
            style={[styles.image, { height: isLandscape ? 360 : 230 }]}
            resizeMode="contain"
          />

          <View style={styles.innerContentContainer}>
            <View style={styles.textsContainer}>
              <ThemedText style={styles.title}>{currentSlide.title}</ThemedText>
              <ThemedText style={styles.description}>
                {currentSlide.description}
              </ThemedText>
              {currentSlide.details && (
                <TouchableOpacity
                  style={styles.linkTextContainer}
                  activeOpacity={0.9}
                  onPress={handleNavToFeatureDetails}
                >
                  <ThemedText style={styles.linkText} suppressHighlighting>
                    للتعرف على المزايا المتوفرة
                  </ThemedText>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.controlsContainer}>
              <View style={styles.dotsContainer}>
                {SLIDES.map((...[, i]) => (
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
                  iconStyle={styles.prevButtonIcon}
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

              <Pressable onPress={finishTutorial}>
                <Text
                  style={[styles.skipText, { color: primaryLightColor }]}
                  suppressHighlighting
                  onPress={finishTutorial}
                >
                  تخطي
                </Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
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
  safeArea: {
    flex: 1,
    width: '100%',
  },
  image: {
    width: '100%',
    height: 300,
    alignSelf: 'center',
  },
  innerContentContainer: {
    flex: 1,
    marginTop: 20,
    paddingHorizontal: 20,
  },
  textsContainer: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontFamily: fontNames.bold,
    lineHeight: 36,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    width: '95%',
    marginVertical: 10,
    fontFamily: fontNames.regular,
  },
  controlsContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
  dotsContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  linkTextContainer: {
    marginTop: 10,
    paddingTop: 2.5,
    paddingHorizontal: 10,
    backgroundColor: '#8bd2c9',
    borderRadius: 20,
  },
  linkText: {
    fontSize: 13,
    color: 'black',
  },
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
    marginVertical: 25,
  },
  prevButton: {
    width: 60,
  },
  prevButtonIcon: {
    transform: [{ rotate: '180deg' }],
  },
  skipText: {
    fontFamily: fontNames.regular,
    fontSize: 16,
  },
});
