import { useState } from 'react';
import { Image, StyleSheet } from 'react-native';

import { useRouter } from 'expo-router';
import { useSetAtom } from 'jotai';
import Animated, { FadeInLeft, FadeOutRight } from 'react-native-reanimated';

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
          style={styles.buttonContent}
        >
          <ThemedText style={styles.buttonText}>التالي</ThemedText>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
          >
            <path
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="m14.25 4.75l-6.19 6.19a1.5 1.5 0 0 0 0 2.12l6.19 6.19"
            />
          </svg>
        </ThemedButton>
      ) : (
        <ThemedButton
          onPress={finishTutorial}
          variant="primary"
          style={styles.buttonContent}
        >
          <ThemedText style={styles.buttonText}>إنتهاء</ThemedText>

          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
          >
            <g
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="9.25" />
              <path
                strokeLinejoin="round"
                d="m16.375 9.194l-5.611 5.612l-3.139-3.134"
              />
            </g>
          </svg>
        </ThemedButton>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: 120,
  },
  buttonText: {
    color: 'white',
    lineHeight: 32,
    marginLeft: 5,
  },
  image: { width: '100%', maxWidth: 600, height: 300, marginBottom: 20 },
});
