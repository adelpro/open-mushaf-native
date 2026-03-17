import { useMemo, useState } from 'react';
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
import { ThemedButton } from '@/components/ThemedButton';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { PAN_GESTURE_CONFIG, SLIDES } from '@/constants';
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
                  source={SLIDES[index].image}
                  style={styles.image}
                  resizeMode="contain"
                />

                <View style={styles.textContainer}>
                  <ThemedText style={styles.title}>
                    {SLIDES[index].title}
                  </ThemedText>
                  {Array.isArray(SLIDES[index].description) ? (
                    SLIDES[index].description.map((item, i) => (
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
                      {SLIDES[index].description}
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

              <ThemedButton
                onPress={
                  index < SLIDES.length - 1
                    ? () => setIndex(index + 1)
                    : finishTutorial
                }
                variant="primary"
                style={styles.button}
              >
                <View style={styles.buttonContent}>
                  {index < SLIDES.length - 1 ? (
                    <>
                      <Text style={styles.buttonText}>التالي</Text>
                      <NextSVG
                        width={24}
                        height={24}
                        style={styles.buttonIcon}
                      />
                    </>
                  ) : (
                    <>
                      <Text style={styles.buttonText}>إنتهاء</Text>
                      <CheckedSVG
                        width={24}
                        height={24}
                        style={styles.buttonIcon}
                      />
                    </>
                  )}
                </View>
              </ThemedButton>
              <View style={styles.closeButtonContainer}>
                <Pressable onPress={finishTutorial}>
                  <Text
                    style={[
                      styles.closeButtonText,
                      { color: primaryLightColor },
                    ]}
                  >
                    تخطي
                  </Text>
                </Pressable>
                <View
                  style={{
                    width: 24,
                    height: 24,
                    backgroundColor: 'transparent',
                  }}
                />
              </View>
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
    justifyContent: 'center',
    alignItems: 'center',
    margin: 'auto',
    padding: 2,
    width: '100%',
    maxWidth: 640,
    position: 'relative',
  },
  closeButtonContainer: {
    flexDirection: 'row',
    margin: 5,
    marginTop: 10,
    width: '100%',
    maxWidth: 300,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontFamily: 'Tajawal_400Regular',
    fontSize: 18,
    paddingHorizontal: 5,
    textAlign: 'center',
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
    width: 15,
    height: 15,
  },
  button: {
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    maxWidth: 300,
    marginTop: 10,
  },
  buttonContent: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    flexDirection: 'row',
  },
  buttonText: {
    color: 'white',
    fontSize: 20,
    fontFamily: 'Tajawal_500Medium',
    paddingHorizontal: 5,
  },
  buttonIcon: {
    color: 'white',
  },
});
