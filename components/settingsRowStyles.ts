/**
 * Shared styles for the SettingsRow component family
 * (SettingsRow, SettingsRowContent, SettingsRowMain, SettingsRowIcon).
 */

import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 14,
    paddingVertical: 14,
    minHeight: 56,
    gap: 10,
  },
  mainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  labelBlock: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    flexShrink: 1,
    fontFamily: 'Tajawal_700Bold',
    fontSize: 16,
    lineHeight: 24,
  },
  description: {
    fontFamily: 'Tajawal_400Regular',
    fontSize: 13,
    lineHeight: 20,
  },
  trailing: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flexShrink: 0,
  },
  chevron: {
    direction: 'ltr',
  },
  children: {
    width: '100%',
  },
  pressed: {
    opacity: 0.72,
  },
});
