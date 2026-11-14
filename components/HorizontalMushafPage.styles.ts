import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  imageContainer: {
    width: '100%',
    height: '100%',
    maxWidth: 640,
    overflow: 'hidden',
  },
  scrollContainer: {
    width: '100%',
    height: '100%',
    maxWidth: 640,
  },
  image: {
    flex: 1,
  },
  errorContainer: {
    width: '100%',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingContainer: {
    width: '100%',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
