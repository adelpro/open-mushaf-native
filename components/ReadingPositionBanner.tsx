import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';

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
  const { tintColor, cardColor, primaryColor, textColor } = useColors();

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
        <ThemedText style={styles.headerContainer}>
          <ThemedText style={[styles.text, { color: tintColor }]}>
            العودة إلى موضع القراءة (صفحة {currentSavedPage})
          </ThemedText>
          <Feather
            name={isCollapsed ? 'chevron-down' : 'chevron-up'}
            size={32}
            color={tintColor}
          />
        </ThemedText>
      </TouchableOpacity>

      {!isCollapsed && (
        <ThemedView
          style={[styles.buttonsContainer, { backgroundColor: cardColor }]}
        >
          <ThemedButton
            variant="primary"
            style={[styles.button, { borderColor: textColor }]}
            onPress={handleSaveCurrentPosition}
            accessibilityLabel="حفظ موضع الحالي"
            accessibilityHint={`حفظ موضع الحالي ${currentPage}`}
          >
            <ThemedView style={styles.buttonContent}>
              <FontAwesome6 name="bookmark" size={24} color={textColor} />
              <ThemedText
                style={{ fontFamily: 'Tajawal_400Regular', color: textColor }}
              >
                حفظ
              </ThemedText>
            </ThemedView>
          </ThemedButton>

          <ThemedButton
            variant="outlined-primary"
            style={[styles.button]}
            onPress={handleReturnToSavedPosition}
            accessibilityLabel="العودة إلى موضع القراءة"
            accessibilityHint={`العودة إلى موضع القراءة ${currentSavedPage}`}
          >
            <ThemedView style={styles.buttonContent}>
              <Feather name="arrow-up-right" size={24} color={primaryColor} />
              <ThemedText
                style={{
                  fontFamily: 'Tajawal_400Regular',
                  color: primaryColor,
                  backgroundColor: 'transparent',
                }}
              >
                العودة
              </ThemedText>
            </ThemedView>
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

    width: '100%',
    marginTop: 5,
  },
  buttonContent: {
    flexDirection: 'row-reverse',
    justifyContent: 'center',
    alignItems: 'center',

    gap: 10,
  },
  toggleIcon: {
    padding: 2,
    margin: 2,
  },
});
