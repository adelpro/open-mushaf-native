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
  iconColor,
}: PageNavigatorProps) {
  const { width } = useWindowDimensions();
  const range = width < 600 ? 1 : 2;

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

  return (
    <ThemedView style={styles.container}>
      {/* Navigation row with page selection/input */}
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
              accessibilityLabel="Page number input"
            />
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleInputSubmit}
            >
              <Feather name="check" size={18} color={primaryColor} />
            </TouchableOpacity>
          </ThemedView>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={[
              styles.pageNumbersContainer,
              { flexGrow: 1 },
            ]}
          >
            {getPageNumbers().map((page, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.pageNumber, // Default style
                  { backgroundColor: cardColor },
                  // Apply larger style if it's the current page
                  page === currentPage && styles.currentPageNumber,
                  // Apply specific background color for current page
                  page === currentPage && { backgroundColor: primaryColor },
                  page === '...' && styles.ellipsis,
                ]}
                onPress={() => handlePageNumberPress(page)}
                disabled={page === '...'}
              >
                <ThemedText
                  style={[
                    styles.pageNumberText,
                    // Apply larger font and white color for current page text
                    page === currentPage && styles.currentPageNumberText,
                  ]}
                >
                  {page}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </ThemedView>

      {!showInput && (
        <ThemedView style={styles.editContainer}>
          <TouchableOpacity
            style={styles.goToPageButton}
            onPress={toggleInput}
            accessibilityLabel="Go to specific page"
          >
            <Feather name="edit" size={16} color={primaryColor} />
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
    // Increased vertical padding for more spacing
    paddingVertical: 15,
    width: '95%',
    maxWidth: 640,
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    // Center content now that arrows are removed
    justifyContent: 'center',
    width: '100%',
    marginBottom: 5, // Add some space between page numbers and edit icon
  },
  // Removed navIcon style as it's no longer used

  pageNumbersContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  pageNumber: {
    // Slightly smaller default size
    minWidth: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 3,
  },
  pageNumberText: {
    fontSize: 13,
    fontFamily: 'Tajawal_500Medium',
  },

  currentPageNumber: {
    minWidth: 36,
    height: 36,
    borderRadius: 18,
  },
  currentPageNumberText: {
    fontSize: 15,
    color: '#fff',
  },
  ellipsis: {
    backgroundColor: 'transparent',
    minWidth: 20,
  },
  editContainer: {
    // Reduced top margin as container padding increased
    marginTop: 5,
    alignItems: 'center',
  },
  goToPageButton: {
    padding: 4,
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
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 60,
    textAlign: 'center',
    fontSize: 14,
  },
  submitButton: {
    padding: 6,
    marginLeft: 4,
  },
});
