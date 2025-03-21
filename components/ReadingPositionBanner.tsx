import React from 'react';
import { Pressable, StyleSheet } from 'react-native';

import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { useRouter } from 'expo-router';

import BookmarkSVG from '@/assets/svgs/bookmark.svg';
import { useColors } from '@/hooks/useColors';
import useCurrentPage from '@/hooks/useCurrentPage';

import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

export default function ReadingPositionBanner() {
  const { isTemporaryNavigation, currentPage, currentSavedPage } =
    useCurrentPage();
  console.log('currentPage', currentPage);
  console.log('isTemporaryNavigation', isTemporaryNavigation);
  console.log('currentSavedPage', currentSavedPage);
  const router = useRouter();
  const { tintColor, cardColor } = useColors();

  if (!isTemporaryNavigation) {
    return null;
  }

  const handleReturnToSavedPosition = () => {
    router.push({
      pathname: '/',
      params: { page: currentSavedPage.toString() },
    });
  };

  const handleSaveCurrentPosition = () => {
    router.push({
      pathname: '/',
      params: { page: currentPage.toString() },
    });
  };

  return (
    <ThemedView style={[styles.container, { backgroundColor: cardColor }]}>
      <ThemedText style={[styles.text, { color: tintColor }]}>
        العودة إلى موضع القراءة (صفحة {currentSavedPage})
      </ThemedText>
      <ThemedView
        style={[styles.buttonsContainer, { backgroundColor: cardColor }]}
      >
        <Pressable
          style={[
            styles.button,
            {
              backgroundColor: 'white',
              borderColor: tintColor,
              borderWidth: 2,
            },
          ]}
          onPress={handleSaveCurrentPosition}
          accessibilityLabel="حفظ موضع الحالي"
          accessibilityHint={`حفظ موضع الحالي ${currentPage}`}
        >
          <FontAwesome6 name="bookmark" size={24} color={tintColor} />
          <ThemedText style={{ color: tintColor }}>حفظ</ThemedText>
        </Pressable>

        <Pressable
          style={[styles.button, { backgroundColor: tintColor }]}
          onPress={handleReturnToSavedPosition}
          accessibilityLabel="العودة إلى موضع القراءة"
          accessibilityHint={`العودة إلى موضع القراءة ${currentSavedPage}`}
        >
          <BookmarkSVG name="bookmark" width={24} height={24} color="white" />
          <ThemedText style={styles.buttonText}>العودة</ThemedText>
        </Pressable>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    width: '100%',
    maxWidth: 640,
    alignItems: 'center',
    padding: 10,
    marginHorizontal: 10,
    elevation: 2,
    gap: 20,
  },
  text: {
    marginHorizontal: 20,
    fontWeight: 'bold',
    fontSize: 16,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 6,
    borderRadius: 6,
    gap: 5,
  },
  buttonText: {
    color: 'white',
    marginEnd: 5,
    fontWeight: 'bold',
  },
  buttonsContainer: {
    flexDirection: 'row',
    gap: 20,
  },
});
