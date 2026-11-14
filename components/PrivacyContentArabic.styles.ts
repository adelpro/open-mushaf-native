import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'flex-start',
  },
  arabicText: {
    textAlign: 'left',
  },

  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    paddingVertical: 20,
    fontFamily: 'Tajawal_700Bold',
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
    color: '#1E90FF',
    textDecorationLine: 'underline',
  },
  linkContainer: {
    marginTop: 40,
    marginBottom: 10,
    alignItems: 'center',
    width: '100%',
  },
});
