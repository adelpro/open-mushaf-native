import { StyleSheet } from 'react-native';

import { isRTL } from '@/utils';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  column: {
    width: '100%',
    maxWidth: 640,
    alignSelf: 'center',
    paddingHorizontal: 20,
  },
  tabContainer: {
    flexDirection: isRTL ? 'row' : 'row-reverse',
    justifyContent: 'space-around',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 18,
    fontWeight: '600',
  },
  scrollContent: {
    width: '100%',
    maxWidth: 640,
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 48,
  },
});
