import { Platform, StyleSheet, I18nManager } from 'react-native';

/**
 * Platform-specific RTL styles for iOS
 * Fixes issue #79: RTL alignment issues on About and Settings screens
 */
export const rtlStyles = StyleSheet.create({
  // Container that properly handles RTL on iOS
  rtlContainer: {
    flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
    writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr',
  },
  
  // Text that respects RTL on iOS
  rtlText: {
    textAlign: I18nManager.isRTL ? 'right' : 'left',
    writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr',
  },
  
  // Column layout for RTL
  rtlColumn: {
    flexDirection: 'column',
    alignItems: I18nManager.isRTL ? 'flex-end' : 'flex-start',
  },
  
  // Row layout with proper RTL handling
  rtlRow: {
    flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
    justifyContent: 'flex-start',
  },
  
  // About screen specific styles
  aboutContainer: {
    flex: 1,
    padding: 20,
    ...(I18nManager.isRTL && Platform.OS === 'ios' ? {
      alignItems: 'flex-end',
    } : {
      alignItems: 'flex-start',
    }),
  },
  
  aboutTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: I18nManager.isRTL ? 'right' : 'left',
    writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr',
  },
  
  aboutText: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 12,
    textAlign: I18nManager.isRTL ? 'right' : 'left',
    writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr',
  },
  
  // Settings screen specific styles
  settingsContainer: {
    flex: 1,
    padding: 16,
  },
  
  settingsRow: {
    flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  
  settingsLabel: {
    fontSize: 16,
    textAlign: I18nManager.isRTL ? 'right' : 'left',
    writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr',
    flex: 1,
  },
  
  settingsValue: {
    fontSize: 16,
    color: '#666',
    textAlign: I18nManager.isRTL ? 'left' : 'right',
    writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr',
  },
});

/**
 * Hook to get RTL-aware styles
 */
export function useRTLStyles() {
  const isRTL = I18nManager.isRTL;
  const isIOS = Platform.OS === 'ios';
  
  return {
    isRTL,
    isIOS,
    textAlign: isRTL ? 'right' : 'left',
    flexDirection: isRTL ? 'row-reverse' : 'row',
    alignItems: isRTL && isIOS ? 'flex-end' : 'flex-start',
    writingDirection: isRTL ? 'rtl' : 'ltr',
  };
}

/**
 * Helper to get text style based on RTL
 */
export function getRTLTextStyle(baseStyle = {}) {
  return {
    ...baseStyle,
    textAlign: I18nManager.isRTL ? 'right' : 'left',
    writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr',
  };
}
