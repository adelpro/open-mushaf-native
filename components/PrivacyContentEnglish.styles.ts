import { StyleSheet } from 'react-native';

import { isRTL } from '@/utils';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'flex-start',
    width: '100%',
  },

  englishText: {
    textAlign: isRTL ? 'right' : 'left',
  },

  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 20,
    paddingVertical: 10,
  },
  content: {
    fontSize: 16,
    lineHeight: 22,
    marginTop: 10,
  },
  link: {
    color: '#1e90ff',
    textDecorationLine: 'underline',
  },

  linkContainer: {
    marginTop: 40,
    marginBottom: 10,
    alignItems: 'center',
    width: '100%',
  },
});
