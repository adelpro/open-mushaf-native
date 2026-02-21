import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';

import { Feather } from '@expo/vector-icons';

import { useColors } from '@/hooks/useColors';
import { getPaginationRange, isCompactView } from '@/utils/dimensionsUtils';

import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

interface PageNavigatorProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  primaryColor: string;
  iconColor: string;
}

export default function PageNavigator({
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

  return (
    <ThemedView
      style={styles.container}
      accessible={true}
      accessibilityLabel="أدوات الانتقال بين الصفحات"
    >
      <ThemedView style={styles.navRow}>
        {showInput ? (
          <ThemedView style={[styles.inputContainer, { flex: 1 }]}>
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
              autoFocus
              onBlur={handleInputSubmit}
              onSubmitEditing={handleInputSubmit}
              // تحسين الوصول لحقل الإدخال
              accessible={true}
              accessibilityLabel="أدخل رقم الصفحة"
              accessibilityHint={`القيمة المتاحة من 1 إلى ${totalPages}`}
            />
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleInputSubmit}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="تأكيد الانتقال"
            >
              <Feather name="check" size={18} color={primaryColor} />
            </TouchableOpacity>
          </ThemedView>
        ) : (
          <>
            {!isCompact ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={[
                  styles.pageNumbersContainer,
                  { flexGrow: 1 },
                ]}
              >
                {getPageNumbers().map((page, index) => {
                  const isCurrent = page === currentPage;
                  const isEllipsis = page === '...';

                  return (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.pageNumber,
                        { backgroundColor: cardColor },
                        isCurrent && styles.currentPageNumber,
                        isCurrent && { backgroundColor: primaryColor },
                        isEllipsis && styles.ellipsis,
                      ]}
                      onPress={() => handlePageNumberPress(page)}
                      disabled={isEllipsis}
                      // خصائص الوصول لأرقام الصفحات
                      accessible={!isEllipsis}
                      accessibilityRole="button"
                      accessibilityLabel={
                        isEllipsis ? 'فجوة صفحات' : `صفحة ${page}`
                      }
                      accessibilityState={{ selected: isCurrent }}
                      accessibilityHint={
                        isCurrent
                          ? 'أنت تشاهد هذه الصفحة حالياً'
                          : 'اضغط للانتقال لهذه الصفحة'
                      }
                    >
                      <ThemedText
                        style={[
                          styles.pageNumberText,
                          isCurrent && styles.currentPageNumberText,
                        ]}
                      >
                        {page}
                      </ThemedText>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            ) : (
              <ThemedView style={styles.compactContainer}>
                <TouchableOpacity
                  style={[
                    styles.compactPageIndicator,
                    { borderColor: primaryColor },
                  ]}
                  onPress={toggleInput}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel={`الصفحة الحالية ${currentPage}`}
                  accessibilityHint="اضغط لكتابة رقم الصفحة يدوياً"
                >
                  <ThemedText
                    style={[styles.compactPageText, { color: primaryColor }]}
                  >
                    {currentPage}
                  </ThemedText>
                </TouchableOpacity>
              </ThemedView>
            )}
          </>
        )}
      </ThemedView>

      {!showInput && (
        <ThemedView style={styles.editContainer}>
          <TouchableOpacity
            style={styles.goToPageButton}
            onPress={toggleInput}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="الانتقال لصفحة محددة"
            accessibilityHint="يفتح حقل كتابة رقم الصفحة"
          >
            <Feather
              name="edit"
              size={isCompact ? 18 : 16}
              color={primaryColor}
            />
          </TouchableOpacity>
        </ThemedView>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    alignSelf: 'center',
    paddingVertical: 15,
    width: '95%',
    maxWidth: 640,
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginBottom: 5,
  },
  pageNumbersContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  pageNumber: {
    minWidth: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
  },
  pageNumberText: {
    fontSize: 15,
    fontFamily: 'Tajawal_500Medium',
  },
  currentPageNumber: {
    minWidth: 46,
    height: 46,
    borderRadius: 23,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  currentPageNumberText: {
    fontSize: 17,
    color: '#fff',
    fontFamily: 'Tajawal_700Bold',
  },
  ellipsis: {
    backgroundColor: 'transparent',
    minWidth: 20,
  },
  editContainer: {
    marginTop: 5,
    alignItems: 'center',
  },
  goToPageButton: {
    padding: 10, // زيادة مساحة اللمس
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: '80%',
  },
  pageInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minWidth: 80,
    textAlign: 'center',
    fontSize: 16,
    fontFamily: 'Tajawal_500Medium',
  },
  submitButton: {
    padding: 10,
    marginLeft: 8,
  },
  compactContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
  },
  compactPageIndicator: {
    minWidth: 60,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  compactPageText: {
    fontSize: 18,
    fontFamily: 'Tajawal_700Bold',
  },
});
