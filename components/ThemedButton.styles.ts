import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  base: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    height: 50,
    width: '90%',
    maxWidth: 640,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0px 5px 5px rgba(0, 0, 0, 0.2)',
    elevation: 5,
  },
  text: {
    fontFamily: 'Tajawal_500Medium',
    fontSize: 18,
  },
  center: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
});
