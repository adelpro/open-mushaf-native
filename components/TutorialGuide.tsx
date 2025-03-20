import { useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

import { usePathname, useRouter } from 'expo-router';
import Animated, {
  FadeInLeft,
  FadeInRight,
  FadeOutLeft,
  FadeOutRight,
} from 'react-native-reanimated';
import { useSetRecoilState } from 'recoil';

import CheckedSVG from '@/assets/svgs/checked.svg';
import NextSVG from '@/assets/svgs/next.svg';
import { ThemedButton } from '@/components/ThemedButton';
import { ThemedText } from '@/components/ThemedText';
import { SLIDES } from '@/constants';
import { useColors } from '@/hooks/useColors';
import { finishedTutorial } from '@/recoil/atoms';
import { isRTL } from '@/utils';

export default function TutorialGuide() {
  const router = useRouter();
  const pathname = usePathname();
  const { primaryColor } = useColors();
  const setFinishedTutorial = useSetRecoilState(finishedTutorial);
  const [index, setIndex] = useState(0);

  const finishTutorial = () => {
    setFinishedTutorial(true);
    if (pathname !== '/') {
      router.replace('/');
    }
  };

  return (
    <Animated.ScrollView
      entering={isRTL ? FadeInLeft.duration(500) : FadeInRight.duration(500)}
      exiting={isRTL ? FadeOutRight.duration(500) : FadeOutLeft.duration(500)}
      contentContainerStyle={styles.animatedContainer}
    >
      <View style={[styles.contentContainer]}>
        <Image
          source={SLIDES[index].image}
          style={styles.image}
          resizeMode="contain"
        />

        <View style={[styles.textContainer, { direction: 'rtl' }]}>
          <ThemedText style={styles.title}>{SLIDES[index].title}</ThemedText>
          {Array.isArray(SLIDES[index].description) ? (
            // Handle array of description items (for mixed content)
            SLIDES[index].description.map((item, i) => (
              <ThemedText
                key={i}
                style={[
                  styles.description,
                  item.align === 'start' && {
                    justifyContent: 'flex-start',
                    textAlign: isRTL ? 'right' : 'left',
                    width: '100%',
                    paddingHorizontal: 25,
                  },
                ]}
              >
                {item.text}
              </ThemedText>
            ))
          ) : (
            // Handle simple string description (centered)
            <ThemedText style={styles.description}>
              {SLIDES[index].description}
            </ThemedText>
          )}
        </View>

        <View style={styles.controlsContainer}>
          <View style={[styles.dotsContainer, { flexDirection: 'row' }]}>
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
                { flexDirection: isRTL ? 'row' : 'row-reverse' },
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
    </Animated.ScrollView>
  );
}

const styles = StyleSheet.create({
  animatedContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    maxWidth: '100%',
    padding: 5,
    paddingBottom: 10,
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: 800,
    padding: 10,
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
    marginBottom: 10,
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
