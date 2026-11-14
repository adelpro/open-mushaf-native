import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-around',
    paddingVertical: 10,
  },
  tab: {
    paddingVertical: 12,
    paddingHorizontal: 30,
    width: 200,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 24,
    lineHeight: 32,
    fontFamily: 'Tajawal_500Medium',
  },
  activeTabText: {
    fontFamily: 'Tajawal_700Bold',
  },
});
