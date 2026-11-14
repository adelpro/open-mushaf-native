import { TouchableOpacity } from 'react-native';

import { Feather } from '@expo/vector-icons';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { useRouter } from 'expo-router';
import { useAtom, useSetAtom } from 'jotai';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  READING_BANNER_HEIGHT_CLOSED,
  READING_BANNER_HEIGHT_OPEN,
} from '@/constants';
import { useColors, useCurrentPage } from '@/hooks';
import { readingBannerCollapsedState, yesterdayPage } from '@/jotai/atoms';

import { styles } from './ReadingPositionBanner.styles';
import { ThemedButton } from './ThemedButton';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

/**
 * An overlay banner component that only displays when a user navigates away from their saved reading position.
 * Features controls for returning to the exact saved page instantly or overriding the bookmark with the current page.
 *
 * @returns A collapsible banner or `null` if the user is not in a temporary navigation state.
 */
export function ReadingPositionBanner() {
  const [isCollapsed, setIsCollapsed] = useAtom(readingBannerCollapsedState);
  const setYesterdayPageValue = useSetAtom(yesterdayPage);

  const HEIGHT = isCollapsed
    ? READING_BANNER_HEIGHT_CLOSED
    : READING_BANNER_HEIGHT_OPEN;

  const { isTemporaryNavigation, currentPage, currentSavedPage } =
    useCurrentPage();
  const router = useRouter();
  const { tintColor, cardColor, primaryColor } = useColors();
  const insets = useSafeAreaInsets();

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

  function renderToggleIcon() {
    function renderHeaderContainer() {
      return (
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
      );
    }
    return (
      <TouchableOpacity
        style={styles.toggleIcon}
        onPress={toggleCollapse}
        accessibilityRole="button"
        accessibilityLabel={
          isCollapsed ? 'توسيع شريط موضع القراءة' : 'طي شريط موضع القراءة'
        }
        accessibilityHint="اضغط لتبديل عرض خيارات موضع القراءة"
      >
        {renderHeaderContainer()}
      </TouchableOpacity>
    );
  }

  function renderButton() {
    return (
      <ThemedButton
        variant="primary"
        style={[styles.button]}
        onPress={handleSaveCurrentPosition}
        accessibilityLabel="حفظ موضع الحالي"
        accessibilityHint={`حفظ موضع الحالي ${currentPage}`}
      >
        <ThemedView style={styles.buttonContent}>
          <FontAwesome6 name="bookmark" size={24} color="white" />
          <ThemedText
            style={{
              fontFamily: 'Tajawal_400Regular',
              backgroundColor: 'transparent',
              color: 'white',
            }}
          >
            حفظ
          </ThemedText>
        </ThemedView>
      </ThemedButton>
    );
  }

  function renderButton2() {
    function renderButtonContent() {
      return (
        <ThemedView
          style={[styles.buttonContent, { backgroundColor: 'transparent' }]}
        >
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
      );
    }
    return (
      <ThemedButton
        variant="outlined-primary"
        style={[styles.button, { backgroundColor: cardColor }]}
        onPress={handleReturnToSavedPosition}
        accessibilityLabel="العودة إلى موضع القراءة"
        accessibilityHint={`العودة إلى موضع القراءة ${currentSavedPage}`}
      >
        {renderButtonContent()}
      </ThemedButton>
    );
  }
  return (
    <ThemedView
      style={[
        styles.container,
        {
          height: HEIGHT + insets.top,
          paddingTop: insets.top,
          paddingLeft: insets.left,
          paddingRight: insets.right,
          backgroundColor: cardColor,
        },
      ]}
    >
      {renderToggleIcon()}

      {!isCollapsed && (
        <ThemedView
          style={[styles.buttonsContainer, { backgroundColor: cardColor }]}
        >
          {renderButton()}

          {renderButton2()}
        </ThemedView>
      )}
    </ThemedView>
  );
}
