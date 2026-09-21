import { Platform, StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: 50,
    maxWidth: 640,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    boxShadow:
      Platform.OS === 'web' ? '0px 5px 5px rgba(0, 0, 0, 0.2)' : undefined,
    shadowColor: 'black',
    shadowOpacity: 0.3,
    shadowRadius: 3.5,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    elevation: 5,
  },
});
