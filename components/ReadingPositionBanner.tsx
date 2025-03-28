import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Feather } from '@expo/vector-icons';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { useRouter } from 'expo-router';

import { useColors } from '@/hooks/useColors';
import useCurrentPage from '@/hooks/useCurrentPage';

import { ThemedButton } from './ThemedButton';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

export default function ReadingPositionBanner() {
  const { isTemporaryNavigation, currentPage, currentSavedPage } =
    useCurrentPage();
  const router = useRouter();
  const { tintColor, cardColor, primaryColor } = useColors();

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
            <Feather name="arrow-up-right" size={24} color={primaryColor} />
            <Text
              style={{ fontFamily: 'Tajawal_400Regular', color: primaryColor }}
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
    width: 150,
  },

  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
  },
  buttonContent: {
    flexDirection: 'row-reverse',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
});
