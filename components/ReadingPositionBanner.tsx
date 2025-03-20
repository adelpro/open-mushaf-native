import React from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { useRouter } from 'expo-router';

import BookmarkSVG from '@/assets/svgs/bookmark.svg';
import { useColors } from '@/hooks/useColors';
import useCurrentPage from '@/hooks/useCurrentPage';

import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

export default function ReadingPositionBanner() {
  const { isTemporaryNavigation, currentPage } = useCurrentPage();
  const router = useRouter();
  const { tintColor, cardColor } = useColors();

  if (!isTemporaryNavigation) {
    return null;
  }

  const handleReturnToSavedPosition = () => {
    router.push({
      pathname: '/',
      params: { page: currentPage.toString() },
    });
  };

  return (
    <ThemedView style={[styles.container, { backgroundColor: cardColor }]}>
      <ThemedText style={styles.text}>
        العودة إلى موضع القراءة (صفحة {currentPage})
      </ThemedText>
      <Pressable
        style={[styles.button, { backgroundColor: tintColor }]}
        onPress={handleReturnToSavedPosition}
        accessibilityLabel="العودة إلى موضع القراءة"
        accessibilityHint={`العودة إلى الصفحة ${currentPage}`}
      >
        <BookmarkSVG name="bookmark" width={24} height={24} color="white" />
        <ThemedText style={styles.buttonText}>العودة</ThemedText>
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: 640,
    alignItems: 'center',
    padding: 10,
    marginHorizontal: 10,
    marginTop: 10,
    borderRadius: 8,
    elevation: 2,
  },
  text: {
    fontSize: 16,
    flex: 1,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  buttonText: {
    color: 'white',
    marginLeft: 5,
    fontWeight: 'bold',
  },
});
