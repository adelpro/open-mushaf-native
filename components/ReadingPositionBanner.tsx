import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Feather } from '@expo/vector-icons';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { useRouter } from 'expo-router';
import { useAtom, useSetAtom } from 'jotai';

import {
  READING_BANNER_HEIGHT_CLOSED,
  READING_BANNER_HEIGHT_OPEN,
} from '@/constants';
import { useColors } from '@/hooks/useColors';
import useCurrentPage from '@/hooks/useCurrentPage';
import { readingBannerCollapsedState, yesterdayPage } from '@/jotai/atoms';

import { ThemedButton } from './ThemedButton';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

export default function ReadingPositionBanner() {
  const [isCollapsed, setIsCollapsed] = useAtom(readingBannerCollapsedState);
  const setYesterdayPageValue = useSetAtom(yesterdayPage);

  const HEIGHT = isCollapsed
    ? READING_BANNER_HEIGHT_CLOSED
    : READING_BANNER_HEIGHT_OPEN;

  const { isTemporaryNavigation, currentPage, currentSavedPage } =
    useCurrentPage();
  const router = useRouter();
  const { tintColor, cardColor, primaryColor } = useColors();

  if (!isTemporaryNavigation) {
    return null;
  }

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

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
    setYesterdayPageValue({
      value: currentPage,
      date: new Date().toDateString(),
    });
  };

  return (
    <ThemedView
      style={[styles.container, { height: HEIGHT, backgroundColor: cardColor }]}
    >
      <TouchableOpacity
        style={styles.toggleIcon}
        onPress={toggleCollapse}
        accessibilityLabel={isCollapsed ? 'Expand banner' : 'Collapse banner'}
      >
        <View style={styles.headerContainer}>
          <ThemedText style={[styles.text, { color: tintColor }]}>
            العودة إلى موضع القراءة (صفحة {currentSavedPage})
          </ThemedText>
          <Feather
            name={isCollapsed ? 'chevron-down' : 'chevron-up'}
            size={32}
            color={tintColor}
          />
        </View>
      </TouchableOpacity>

      {!isCollapsed && (
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
              <Text
                style={{ fontFamily: 'Tajawal_400Regular', color: 'white' }}
              >
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
                style={{
                  fontFamily: 'Tajawal_400Regular',
                  color: primaryColor,
                }}
              >
                العودة
              </Text>
            </View>
          </ThemedButton>
        </ThemedView>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    width: '100%',
    maxWidth: 640,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginHorizontal: 'auto',
    elevation: 2,
    gap: 15,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  text: {
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'right',
    flexShrink: 1,
    marginRight: 10,
  },
  button: {
    width: 150,
    minWidth: 120,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'transparent',
    width: '100%',
    marginTop: 5,
  },
  buttonContent: {
    flexDirection: 'row-reverse',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    gap: 10,
  },
  toggleIcon: {
    padding: 2,
    margin: 2,
  },
});
