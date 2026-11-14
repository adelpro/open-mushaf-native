import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
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
    // Increased size for better touch targets
    minWidth: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5, // Increased horizontal spacing
    paddingHorizontal: 4, // Added padding for numbers with multiple digits
  },
  pageNumberText: {
    fontSize: 14, // Slightly larger font
    fontFamily: 'Tajawal_500Medium',
  },

  currentPageNumber: {
    minWidth: 44,
    height: 44,
    borderRadius: 22,
  },
  currentPageNumberText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500', // Added for better emphasis
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
  compactContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
  },
  compactPageIndicator: {
    minWidth: 50,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  compactPageText: {
    fontSize: 16,
    fontFamily: 'Tajawal_500Medium',
    fontWeight: '500',
  },
});
