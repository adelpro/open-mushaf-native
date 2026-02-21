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
      // تنبيه قارئ الشاشة بوجود منطقة معلومات جديدة
      accessible={true}
      accessibilityRole="summary"
      accessibilityLabel={`شريط موضع القراءة. الصفحة المحفوظة حالياً هي ${currentSavedPage}`}
    >
      <TouchableOpacity
        style={styles.toggleIcon}
        onPress={toggleCollapse}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={
          isCollapsed ? 'توسيع شريط موضع القراءة' : 'طوي شريط موضع القراءة'
        }
        accessibilityState={{ expanded: !isCollapsed }}
      >
        <ThemedView
          style={[styles.headerContainer, { backgroundColor: 'transparent' }]}
        >
          <ThemedText
            style={[
              styles.text,
              { color: tintColor, fontFamily: 'Tajawal_400Regular' },
            ]}
          >
            العودة إلى موضع القراءة (صفحة {currentSavedPage})
          </ThemedText>
          <Feather
            name={isCollapsed ? 'chevron-down' : 'chevron-up'}
            size={32}
            color={tintColor}
          />
        </ThemedView>
      </TouchableOpacity>

      {!isCollapsed && (
        <ThemedView
          style={[styles.buttonsContainer, { backgroundColor: cardColor }]}
        >
          <ThemedButton
            variant="primary"
            style={[styles.button]}
            onPress={handleSaveCurrentPosition}
            // قمنا بتعريب نصوص الوصول لضمان تجربة مستخدم عربية كاملة
            accessibilityLabel="حفظ الموضع الحالي"
            accessibilityHint={`سيتم حفظ الصفحة رقم ${currentPage} كموضع قراءة جديد`}
          >
            <ThemedView style={styles.buttonContent}>
              <FontAwesome6 name="bookmark" size={20} color="white" />
              <ThemedText
                style={{
                  fontFamily: 'Tajawal_400Regular',
                  backgroundColor: 'transparent',
                  color: 'white',
                  fontSize: 16,
                }}
              >
                حفظ
              </ThemedText>
            </ThemedView>
          </ThemedButton>

          <ThemedButton
            variant="outlined-primary"
            style={[styles.button, { backgroundColor: cardColor }]}
            onPress={handleReturnToSavedPosition}
            accessibilityLabel="العودة للموضع السابق"
            accessibilityHint={`العودة لصفحة رقم ${currentSavedPage}`}
          >
            <ThemedView
              style={[styles.buttonContent, { backgroundColor: 'transparent' }]}
            >
              <Feather name="arrow-up-right" size={20} color={primaryColor} />
              <ThemedText
                style={{
                  fontFamily: 'Tajawal_400Regular',
                  color: primaryColor,
                  backgroundColor: 'transparent',
                  fontSize: 16,
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
    gap: 10,
    // إضافة ظل خفيف للـ iOS ليتناسب مع الـ elevation في الأندرويد
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  headerContainer: {
    flexDirection: 'row-reverse', // جعل الأيقونة والنص متوافقين مع اللغة العربية
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  text: {
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'right',
    flexShrink: 1,
  },
  button: {
    width: '45%', // استخدام نسبة مئوية لضمان التجاوب
    minWidth: 120,
    height: 45,
  },
  buttonsContainer: {
    flexDirection: 'row-reverse', // ترتيب الأزرار لتبدأ من اليمين
    justifyContent: 'center',
    alignItems: 'center',
    gap: 15,
    width: '100%',
    marginTop: 5,
  },
  buttonContent: {
    flexDirection: 'row-reverse',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    gap: 8,
  },
  toggleIcon: {
    width: '100%',
    paddingVertical: 5,
  },
});
