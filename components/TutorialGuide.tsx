import { useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

import { usePathname, useRouter } from 'expo-router';
import { useSetAtom } from 'jotai';
import Animated, { FadeInLeft, FadeOutRight } from 'react-native-reanimated';

import CheckedSVG from '@/assets/svgs/checked.svg';
import NextSVG from '@/assets/svgs/next.svg';
import { ThemedButton } from '@/components/ThemedButton';
import { ThemedText } from '@/components/ThemedText';
import { SLIDES } from '@/constants';
import { useColors } from '@/hooks/useColors';
import { finishedTutorial } from '@/jotai/atoms';
import { isRTL } from '@/utils';

import { ThemedSafeAreaView } from './ThemedSafeAreaView';

export default function TutorialGuide() {
  const router = useRouter();
  const pathname = usePathname();
  const { primaryColor } = useColors();
  const setFinishedTutorial = useSetAtom(finishedTutorial);
  const [index, setIndex] = useState(0);
  const rtl = isRTL;

  const finishTutorial = () => {
    setFinishedTutorial(true);
    if (pathname !== '/') {
      router.replace('/');
    }
  };

  return (
    <ThemedSafeAreaView style={styles.container}>
      <Animated.View
        entering={FadeInLeft.duration(500)}
        exiting={FadeOutRight.duration(500)}
        style={styles.animatedContainer}
      >
        <View style={styles.contentContainer}>
          <Image
            source={SLIDES[index].image}
            style={styles.image}
            resizeMode="contain"
          />

          <View style={styles.textContainer}>
            <ThemedText style={styles.title}>{SLIDES[index].title}</ThemedText>
            <ThemedText style={styles.description}>
              {SLIDES[index].description}
            </ThemedText>
          </View>

          <View style={styles.controlsContainer}>
            <View
              style={[
                styles.dotsContainer,
                { flexDirection: rtl ? 'row' : 'row-reverse' },
              ]}
            >
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
              <View
                style={[
                  styles.buttonContent,
                  { flexDirection: rtl ? 'row' : 'row-reverse' },
                ]}
              >
                {index < SLIDES.length - 1 ? (
                  <>
                    <NextSVG width={24} height={24} style={styles.buttonIcon} />
                    <Text style={styles.buttonText}>التالي</Text>
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
          </View>
        </View>
      </Animated.View>
    </ThemedSafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
    padding: 5,
    paddingBottom: 20,
  },
  animatedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  contentContainer: {
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: 600,
    height: '100%',
    maxHeight: 600,
    padding: 10,
  },
  image: {
    width: '100%',
    height: 300,
    marginBottom: 10,
  },
  textContainer: {
    width: '100%',
    alignItems: 'center',
    marginVertical: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    lineHeight: 36,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 15,
    width: '100%',
  },
  controlsContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 10,
  },
  dotsContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
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
  },
  buttonContent: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  buttonText: {
    color: 'white',
    fontSize: 24,
    paddingHorizontal: 5,
  },
  buttonIcon: {
    color: 'white',
  },
});
