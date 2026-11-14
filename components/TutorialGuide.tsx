import { useEffect, useMemo, useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
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
import { ThemedButton } from '@/components/ThemedButton';
import { ThemedIcon } from '@/components/ThemedIcon';
import { ThemedText } from '@/components/ThemedText';
import { getPanThreshold, PAN_GESTURE_CONFIG, SLIDES } from '@/constants';
import { useColors, useOrientation } from '@/hooks';
import { finishedTutorial, panGestureSensitivity } from '@/jotai/atoms';
import { isRTL } from '@/utils';

import { styles } from './TutorialGuide.styles';

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

  function renderActionButtonsContainer() {
    function renderIconButton() {
      return (
        <ThemedButton
          style={styles.iconButton}
          variant="outlined-primary"
          disabled={isPrevDisabled}
          onPress={handlePrev}
        >
          <View style={styles.iconButtonContent}>
            <ThemedIcon
              icon={NextSVG}
              iconStyle={styles.prevIcon}
              variant="outlined-primary"
              disabled={isPrevDisabled}
            />
          </View>
        </ThemedButton>
      );
    }
    return (
      <View style={styles.actionButtonsContainer}>
        {renderIconButton()}
        <ThemedButton
          style={styles.primaryButton}
          variant="primary"
          onPress={nextButtonPressAction}
        >
          <View style={styles.primaryButtonContent}>
            <ThemedText style={styles.primaryButtonText}>
              {nextButtonTitle}
            </ThemedText>
            <ThemedIcon icon={nextButtonIcon} variant="primary" />
          </View>
        </ThemedButton>
      </View>
    );
  }

  function renderInnerContentContainer() {
    function renderControlsContainer() {
      function renderDotsContainer() {
        return (
          <View style={styles.dotsContainer}>
            {SLIDES.map((...[, i]) => {
              return (
                <View
                  key={i}
                  style={[
                    styles.dot,
                    i === index && styles.activeDot,
                    i === index && { backgroundColor: primaryColor },
                  ]}
                />
              );
            })}
          </View>
        );
      }
      return (
        <View style={styles.controlsContainer}>
          {renderDotsContainer()}
          {renderActionButtonsContainer()}

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
      );
    }

    function renderTextsContainer() {
      return (
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
      );
    }
    return (
      <View style={styles.innerContentContainer}>
        {renderTextsContainer()}

        {renderControlsContainer()}
      </View>
    );
  }

  function renderAnimatedContainer() {
    return (
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

          {renderInnerContentContainer()}
        </ScrollView>
      </Animated.View>
    );
  }
  return (
    <GestureDetector gesture={gestureHandler}>
      {renderAnimatedContainer()}
    </GestureDetector>
  );
}
