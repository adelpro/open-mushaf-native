import { useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

import { useRouter } from 'expo-router';
import { useSetAtom } from 'jotai';
import Animated, { FadeInLeft, FadeOutRight } from 'react-native-reanimated';

import CheckedSVG from '@/assets/svgs/checked.svg';
import NextSVG from '@/assets/svgs/next.svg';
import { ThemedButton } from '@/components/ThemedButton';
import { ThemedText } from '@/components/ThemedText';
import { useColors } from '@/hooks/useColors';
import { finichedTutorial } from '@/jotai/atoms';
import { isRTL } from '@/utils';

const slides = [
  {
    title: 'مرحبا!',
    description: 'مرحبا بك في تطبيق المصحف',
    image: require('@/assets/images/icon.png'),
  },
  {
    title: 'المصحف',
    description: `يمكنك التنقل بين الصفحات عن طريق السحب نحو اليمين أو نحو اليسار`,
    image: require('@/assets/tutorial/mushaf.png'),
  },
  {
    title: 'القائمة العلوية',
    description: `يمكنك إظهار القائمة العلوية بالضغط على صفحة المصحف، تحتوي القائمة على خيارات:
 - ملئ الشاشة: تقوم بإضهار وإخفاء القائمة السفلية.
 - خاصية التنقل: تسمح لك بالتنقل في المصحف بكل سلاسة سواء بالصفحات أو الآيات.
 - خاصية البحث: تتيح لك البحث في نص القرآن الكريم.`,
    image: require('@/assets/tutorial/top-menu.png'),
  },
  {
    title: 'قائمة التفسير',
    description: `يمكنك إظهار قائمة التفسير بالضغط مطولا على صفحة المصحف، تحتوي القائمة على خيارات عديدة للتفسير `,
    image: require('@/assets/tutorial/tafseer.png'),
  },
  {
    title: 'صفحة البحث',
    description:
      'يمكنك الوصول إلى صفحة البحث من القائمة العلوية في المصحف، وتتيح لك البحث في نص القرآن الكريم.',
    image: require('@/assets/tutorial/search.png'),
  },
  {
    title: 'صفحة التنقل',
    description:
      'يمكنك الوصول إلى صفحة التنقل من القائمة العلوية في المصحف، وتتيح لك التنقل بسلاسة في المصحف الكريم.',
    image: require('@/assets/tutorial/navigation.png'),
  },
];

export default function TutorialScreen() {
  const router = useRouter();
  const { primaryColor } = useColors();
  const setFinichedTutorial = useSetAtom(finichedTutorial);
  const [index, setIndex] = useState(0);

  const finishTutorial = () => {
    setFinichedTutorial(true);
    router.replace('/');
  };

  return (
    <Animated.View
      entering={FadeInLeft.duration(500)}
      exiting={FadeOutRight.duration(500)}
      style={{ justifyContent: 'center', alignItems: 'center' }}
    >
      <View style={styles.container}>
        <Image
          source={slides[index].image}
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
            {slides[index].title}
          </ThemedText>
          <ThemedText
            style={{
              fontSize: 16,
              textAlign: isRTL ? 'left' : 'right',
              marginBottom: 5,
            }}
          >
            {slides[index].description}
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
            {slides.map((_, i) => (
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
          {index < slides.length - 1 ? (
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
  );
}

const styles = StyleSheet.create({
  container: {
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
