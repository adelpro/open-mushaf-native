import { Fragment, useState } from 'react';
import {
  ScrollView,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';

import { Feather } from '@expo/vector-icons';

import { useColors } from '@/hooks';
import { getPaginationRange, isCompactView } from '@/utils/dimensionsUtils';

import { styles } from './PageNavigator.styles';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

/**
 * Props for the PageNavigator component.
 */
interface PageNavigatorProps {
  /** The currently active page number. */
  currentPage: number;
  /** The maximum possible page index. */
  totalPages: number;
  /** Callback emitted when the user selects or inputs a new page. */
  onPageChange: (page: number) => void;
  /** Primary theme color used for indicators and borders. */
  primaryColor: string;
  /** Secondary theme color mapped to navigational icons. */
  iconColor: string;
}

/**
 * A horizontal pagination control component for traversing the Mushaf pages.
 * Adaptively renders a scrolling number slider on larger layouts or a compact
 * tap-to-edit indicator on tighter layouts.
 *
 * @param props - Configuration properties defined in `PageNavigatorProps`.
 * @returns A bounded pagination view element.
 */
export function PageNavigator({
  currentPage,
  totalPages,
  onPageChange,
  primaryColor,
}: PageNavigatorProps) {
  const { width } = useWindowDimensions();
  const range = getPaginationRange(width);
  const isCompact = isCompactView(width);

  const { cardColor } = useColors();

  const [inputValue, setInputValue] = useState(currentPage.toString());
  const [showInput, setShowInput] = useState(false);

  // Pagination logic: iterate all pages, show page 1, last page, and pages around currentPage.
  // Insert ellipsis only once in gaps (and avoid ellipsis adjacent to 1 or last page).
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - range && i <= currentPage + range)
      ) {
        pages.push(i);
      } else if (pages[pages.length - 1] !== '...') {
        pages.push('...');
      }
    }
    return pages;
  };

  const handlePageNumberPress = (page: number | string) => {
    if (typeof page === 'number') {
      onPageChange(page);
    }
  };

  const handleInputChange = (text: string) => {
    const numericValue = text.replace(/[^0-9]/g, '');
    setInputValue(numericValue);
  };

  const handleInputSubmit = () => {
    const pageNumber = parseInt(inputValue, 10);
    if (!isNaN(pageNumber) && pageNumber >= 1 && pageNumber <= totalPages) {
      onPageChange(pageNumber);
    } else {
      setInputValue(currentPage.toString());
    }
    setShowInput(false);
  };

  const toggleInput = () => {
    setShowInput(!showInput);
    setInputValue(currentPage.toString());
  };

  function renderNavRow() {
    function renderInputContainer() {
      function renderPageInput() {
        return (
          <TextInput
            style={[
              styles.pageInput,
              { color: primaryColor, borderColor: primaryColor },
              width < 600 && { minWidth: 40, paddingHorizontal: 2 },
            ]}
            value={inputValue}
            onChangeText={handleInputChange}
            keyboardType="numeric"
            maxLength={4}
            autoFocus={true}
            onBlur={handleInputSubmit}
            onSubmitEditing={handleInputSubmit}
            accessibilityLabel="أدخل رقم الصفحة"
          />
        );
      }
      return (
        <ThemedView style={[styles.inputContainer, { flex: 1 }]}>
          {renderPageInput()}
          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleInputSubmit}
            accessibilityLabel="تأكيد رقم الصفحة"
            accessibilityHint="اضغط للانتقال إلى رقم الصفحة المدخل"
            accessibilityRole="button"
          >
            <Feather name="check" size={18} color={primaryColor} />
          </TouchableOpacity>
        </ThemedView>
      );
    }

    function renderContent() {
      function renderScrollView() {
        return (
          <ScrollView
            horizontal={true}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={[
              styles.pageNumbersContainer,
              { flexGrow: 1 },
            ]}
          >
            {getPageNumbers().map((page, index) => {
              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.pageNumber,
                    { backgroundColor: cardColor },
                    page === currentPage && styles.currentPageNumber,
                    page === currentPage && { backgroundColor: primaryColor },
                    page === '...' && styles.ellipsis,
                  ]}
                  onPress={() => handlePageNumberPress(page)}
                  disabled={page === '...'}
                  accessibilityLabel={
                    page === '...' ? 'المزيد من الصفحات' : `صفحة ${page}`
                  }
                  accessibilityHint={
                    page === '...'
                      ? undefined
                      : `اضغط للانتقال إلى صفحة ${page}`
                  }
                  accessibilityRole="button"
                  accessibilityState={{ selected: page === currentPage }}
                >
                  <ThemedText
                    style={[
                      styles.pageNumberText,
                      page === currentPage && styles.currentPageNumberText,
                    ]}
                  >
                    {page}
                  </ThemedText>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        );
      }

      function renderCompactContainer() {
        function renderCompactPageIndicator() {
          return (
            <TouchableOpacity
              style={[
                styles.compactPageIndicator,
                { borderColor: primaryColor },
              ]}
              onPress={toggleInput}
              accessibilityLabel={`الصفحة الحالية ${currentPage}`}
              accessibilityHint="اضغط لإدخال رقم صفحة للانتقال إليها"
              accessibilityRole="button"
            >
              <ThemedText
                style={[styles.compactPageText, { color: primaryColor }]}
              >
                {currentPage}
              </ThemedText>
            </TouchableOpacity>
          );
        }
        return (
          <ThemedView style={styles.compactContainer}>
            {renderCompactPageIndicator()}
          </ThemedView>
        );
      }
      return (
        <Fragment>
          {!isCompact ? renderScrollView() : renderCompactContainer()}
        </Fragment>
      );
    }
    return (
      <ThemedView style={styles.navRow}>
        {showInput ? renderInputContainer() : renderContent()}
      </ThemedView>
    );
  }

  function renderEditContainer() {
    return (
      <ThemedView style={styles.editContainer}>
        <TouchableOpacity
          style={styles.goToPageButton}
          onPress={toggleInput}
          accessibilityRole="button"
          accessibilityLabel="الانتقال إلى صفحة محددة"
        >
          <Feather
            name="edit"
            size={isCompact ? 18 : 16}
            color={primaryColor}
          />
        </TouchableOpacity>
      </ThemedView>
    );
  }
  return (
    <ThemedView style={styles.container}>
      {/* Navigation row with page selection/input */}
      {renderNavRow()}

      {!showInput && renderEditContainer()}
    </ThemedView>
  );
}
