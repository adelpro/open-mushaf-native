import { useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';

import { useRouter } from 'expo-router';
import { useSetAtom } from 'jotai';
import Animated, { FadeInLeft, FadeOutRight } from 'react-native-reanimated';

import CheckedSVG from '@/assets/svgs/checked.svg';
import NextSVG from '@/assets/svgs/next.svg';
import { ThemedButton } from '@/components/ThemedButton';
import { ThemedText } from '@/components/ThemedText';
import { finichedTutorial } from '@/jotai/atoms';

const slides = [
  {
    title: 'مرحبا!',
    description: 'مرحبا بك في تطبيق المصحف',
    image: require('../assets/images/icon.png'),
  },
  {
    title: 'المصحف',
    description: `يمكنك التنقل بين الصفحات عن طريق السحب نحو اليمين أو نحو اليسار`,
    image: require('../assets/tutorial/mushaf.png'),
  },
  {
    title: 'القائمة العلوية',
    description: `يمكنك إظهار القائمة العلوية بالضغط على صفحة المصحف، تحتوي القائمة على خيارات:
 - ملئ الشاشة: تقوم بإضهار وإخفاء القائمة السفلية.
 - خاصية التنقل: تسمح لك بالتنقل في المصحف بكل سلاسة سواء بالصفحات أو الآيات.
 - خاصية البحث: تتيح لك البحث في نص القرآن الكريم.`,
    image: require('../assets/tutorial/top-menu.png'),
  },
  {
    title: 'قائمة التفسير',
    description: `يمكنك إظهار قائمة التفسير بالضغط مطولا على صفحة المصحف، تحتوي القائمة على خيارات عديدة للتفسير `,
    image: require('../assets/tutorial/tafseer.png'),
  },
  {
    title: 'صفحة البحث',
    description:
      'يمكنك الوصول إلى صفحة البحث من القائمة العلوية في المصحف، وتتيح لك البحث في نص القرآن الكريم.',
    image: require('../assets/tutorial/search.png'),
  },
  {
    title: 'صفحة التنقل',
    description:
      'يمكنك الوصول إلى صفحة التنقل من القائمة العلوية في المصحف، وتتيح لك التنقل بسلاسة في المصحف الكريم.',
    image: require('../assets/tutorial/navigation.png'),
  },
];

export default function TutorialScreen() {
  const router = useRouter();
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
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
      }}
    >
      <Image
        source={slides[index].image}
        style={styles.image}
        resizeMode="contain"
      />
      <ThemedText
        style={{
          fontSize: 28,
          fontWeight: 'bold',
          marginBottom: 20,
          padding: 10,
        }}
      >
        {slides[index].title}
      </ThemedText>
      <ThemedText
        style={{
          fontSize: 16,
          textAlign: 'right',
          marginBottom: 30,
        }}
      >
        {slides[index].description}
      </ThemedText>

      {index < slides.length - 1 ? (
        <ThemedButton
          onPress={() => setIndex(index + 1)}
          variant="primary"
          style={styles.button}
        >
          <View style={styles.buttonContent}>
            <ThemedText style={styles.buttonText}>التالي</ThemedText>
            <NextSVG width={24} height={24} style={styles.svg} />
          </View>
        </ThemedButton>
      ) : (
        <ThemedButton
          onPress={finishTutorial}
          variant="primary"
          style={styles.button}
        >
          <View style={styles.buttonContent}>
            <CheckedSVG width={24} height={24} style={styles.svg} />
            <ThemedText style={styles.buttonText}>إنتهاء</ThemedText>
          </View>
        </ThemedButton>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    width: 200,
  },
  buttonContent: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  buttonText: {
    color: 'white',
    fontSize: 24,
    lineHeight: 34,
    marginHorizontal: 10,
  },
  svg: {
    color: 'white',
  },
  image: { width: '100%', maxWidth: 600, height: 300, marginBottom: 20 },
});
