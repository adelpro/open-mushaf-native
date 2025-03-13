import { useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

import { usePathname, useRouter } from 'expo-router';
import Animated, { FadeInLeft, FadeOutRight } from 'react-native-reanimated';
import { useSetRecoilState } from 'recoil';

import CheckedSVG from '@/assets/svgs/checked.svg';
import NextSVG from '@/assets/svgs/next.svg';
import { ThemedButton } from '@/components/ThemedButton';
import { ThemedText } from '@/components/ThemedText';
import { SLIDES } from '@/constants';
import { useColors } from '@/hooks/useColors';
import { finishedTutorial } from '@/recoil/atom';
import { isRTL } from '@/utils';

import { ThemedSafeAreaView } from './ThemedSafeAreaView';

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
    <ThemedSafeAreaView style={styles.container}>
      <Animated.View
        entering={FadeInLeft.duration(500)}
        exiting={FadeOutRight.duration(500)}
        style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
      >
        <View style={styles.contentContainer}>
          <Image
            source={SLIDES[index].image}
            style={styles.image}
            resizeMode="contain"
          />
          <View style={styles.sectionContainer}>
            <ThemedText
              style={{
                fontSize: 28,
                fontWeight: 'bold',
                marginBottom: 5,
                padding: 10,
              }}
            >
              {SLIDES[index].title}
            </ThemedText>
            <ThemedText
              style={{
                fontSize: 16,
                textAlign: isRTL ? 'left' : 'right',
                marginBottom: 5,
              }}
            >
              {SLIDES[index].description}
            </ThemedText>
          </View>
          <View style={styles.sectionContainer}>
            <View
              style={{
                flexDirection: isRTL ? 'row' : 'row-reverse',
                marginBottom: 5,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              {SLIDES.map((_, i) => (
                <View
                  key={i}
                  style={{
                    width: i === index ? 15 : 5,
                    height: i === index ? 15 : 5,
                    marginVertical: 10,
                    borderRadius: 4,
                    marginHorizontal: 5,
                    backgroundColor: i === index ? primaryColor : '#E0E0E0',
                  }}
                />
              ))}
            </View>
            {index < SLIDES.length - 1 ? (
              <ThemedButton
                onPress={() => setIndex(index + 1)}
                variant="primary"
                style={styles.button}
              >
                <View style={styles.buttonContent}>
                  <NextSVG width={24} height={24} style={styles.svg} />
                  <Text style={styles.buttonText}>التالي</Text>
                </View>
              </ThemedButton>
            ) : (
              <ThemedButton
                onPress={finishTutorial}
                variant="primary"
                style={styles.button}
              >
                <View style={styles.buttonContent}>
                  <Text style={styles.buttonText}>إنتهاء</Text>
                  <CheckedSVG width={24} height={24} style={styles.svg} />
                </View>
              </ThemedButton>
            )}
          </View>
        </View>
      </Animated.View>
    </ThemedSafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
    padding: 5,
    paddingBottom: 20,
  },
  contentContainer: {
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 5,
    width: '100%',
    maxWidth: 600,
    height: '100%',
    maxHeight: 600,
    marginTop: 10,
  },
  button: {
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    width: 200,
  },
  buttonContent: {
    flexDirection: isRTL ? 'row' : 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    width: 200,
    height: 50,
  },
  buttonText: {
    color: 'white',
    fontSize: 24,
    lineHeight: 26,
    paddingHorizontal: 5,
  },
  sectionContainer: {
    rowGap: 5,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  svg: {
    color: 'white',
  },
  image: { width: '100%', maxWidth: 600, height: 300, marginBottom: 5 },
});
