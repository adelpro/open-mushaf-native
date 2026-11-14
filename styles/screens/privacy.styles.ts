import { StyleSheet } from 'react-native';

import { Colors } from '@/constants/Colors';
import { isRTL } from '@/utils';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  tabContainer: {
    flexDirection: isRTL ? 'row' : 'row-reverse',
    justifyContent: 'space-around',
    marginBottom: 20,
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
    paddingBottom: 40,
  },
  link: {
    marginTop: 20,
    alignItems: 'center',
    height: 48,
    justifyContent: 'center',
  },
  linkText: {
    fontSize: 16,
    color: Colors.light.tint,
    textDecorationLine: 'underline',
  },
});
