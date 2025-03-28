import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { useRouter } from 'expo-router';

import BookmarkSVG from '@/assets/svgs/bookmark.svg';
import { useColors } from '@/hooks/useColors';
import useCurrentPage from '@/hooks/useCurrentPage';

import { ThemedButton } from './ThemedButton';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

export default function ReadingPositionBanner() {
  const { isTemporaryNavigation, currentPage, currentSavedPage } =
    useCurrentPage();
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
        <ThemedButton
          variant="primary"
          style={styles.button}
          onPress={handleSaveCurrentPosition}
          accessibilityLabel="حفظ موضع الحالي"
          accessibilityHint={`حفظ موضع الحالي ${currentPage}`}
        >
          <View style={styles.buttonContent}>
            <FontAwesome6 name="bookmark" size={24} color="white" />
            <Text style={{ fontFamily: 'Tajawal_400Regular', color: 'white' }}>
              حفظ
            </Text>
          </View>
        </ThemedButton>

        <ThemedButton
          variant="outlined-primary"
          style={styles.button}
          onPress={handleReturnToSavedPosition}
          accessibilityLabel="العودة إلى موضع القراءة"
          accessibilityHint={`العودة إلى موضع القراءة ${currentSavedPage}`}
        >
          <View style={styles.buttonContent}>
            <BookmarkSVG
              name="bookmark"
              width={24}
              height={24}
              fill="white"
              style={{ color: tintColor }}
            />
            <Text
              style={{ fontFamily: 'Tajawal_400Regular', color: tintColor }}
            >
              العودة
            </Text>
          </View>
        </ThemedButton>
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
    paddingTop: 20,
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
    width: 120,
  },

  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
  },
  buttonContent: {
    flexDirection: 'row-reverse',
    gap: 10,
  },
});
