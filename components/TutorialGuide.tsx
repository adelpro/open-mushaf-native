import { useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';

import { usePathname, useRouter } from 'expo-router';
import { useSetAtom } from 'jotai/react';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  FadeInLeft,
  FadeInRight,
  FadeOutLeft,
  FadeOutRight,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import CheckedSVG from '@/assets/svgs/checked.svg';
import NextSVG from '@/assets/svgs/next.svg';
import { ThemedButton } from '@/components/ThemedButton';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { SLIDES } from '@/constants';
import { useColors } from '@/hooks/useColors';
import useOrientation from '@/hooks/useOrientation';
import { finishedTutorial } from '@/jotai/atoms';
import { isRTL } from '@/utils';

export default function TutorialGuide() {
  const router = useRouter();
  const pathname = usePathname();
  const { primaryColor } = useColors();
  const setFinishedTutorial = useSetAtom(finishedTutorial);
  const { isLandscape } = useOrientation();
  const [index, setIndex] = useState(0);

  const translateX = useSharedValue(0);

  const finishTutorial = () => {
    setFinishedTutorial(true);
    if (pathname !== '/') {
      router.replace('/');
    }
  };

  const gestureHandler = Gesture.Pan()
    .onUpdate((e) => {
      translateX.value = Math.max(-100, Math.min(100, e.translationX));
    })
    .onEnd((e) => {
      const threshold = isLandscape ? 150 : 100;

      if (e.translationX < -threshold && index < SLIDES.length - 1) {
        runOnJS(setIndex)(index + 1);
      } else if (e.translationX > threshold && index > 0) {
        runOnJS(setIndex)(index - 1);
      }

      translateX.value = withSpring(0, { damping: 20, stiffness: 90 });
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <GestureDetector gesture={gestureHandler}>
      <Animated.View
        entering={isRTL ? FadeInLeft.duration(500) : FadeInRight.duration(500)}
        exiting={isRTL ? FadeOutRight.duration(500) : FadeOutLeft.duration(500)}
        style={[styles.animatedContainer, animatedStyle]}
      >
        <ThemedView style={styles.mainContainer}>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
          >
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
                    <NextSVG width={24} height={24} style={styles.buttonIcon} />
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
          </ThemedView>
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
    height: '100%',
    maxWidth: 640,
  },
  mainContainer: {
    flex: 1,
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  scrollView: {
    flex: 1,
    width: '100%',
    maxWidth: 640,
    padding: 1,
    marginTop: 10,
  },
  scrollContent: {
    paddingHorizontal: 10,
    paddingBottom: 20,
    width: '100%',
    maxWidth: 640,
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
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    width: 200,
    marginBottom: 10,
  },
  buttonContent: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    flexDirection: 'row',
  },
  buttonText: {
    color: 'white',
    fontSize: 24,
    fontFamily: 'Tajawal_700Bold',
    paddingHorizontal: 5,
  },
  buttonIcon: {
    color: 'white',
  },
});
