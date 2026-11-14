import { StyleSheet } from 'react-native';

import { fontNames } from '@/constants';
export const styles = StyleSheet.create({
  animatedContainer: {
    flex: 1,
    alignItems: 'center',
    margin: 'auto',
    width: '100%',
    maxWidth: 640,
  },
  safeArea: {
    flex: 1,
    width: '100%',
  },
  image: {
    width: '100%',
    height: 300,
    alignSelf: 'center',
  },
  innerContentContainer: {
    flex: 1,
    marginTop: 20,
    paddingHorizontal: 20,
  },
  textsContainer: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontFamily: fontNames.bold,
    lineHeight: 36,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    width: '95%',
    marginVertical: 10,
    fontFamily: fontNames.regular,
  },
  controlsContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
  dotsContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  linkTextContainer: {
    marginTop: 10,
    paddingTop: 2.5,
    paddingHorizontal: 10,
    backgroundColor: '#8bd2c9',
    borderRadius: 20,
  },
  linkText: {
    fontSize: 13,
    color: 'black',
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 4,
    marginHorizontal: 5,
    backgroundColor: '#E0E0E0',
  },
  activeDot: {
    width: 20,
    height: 8,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    gap: 15,
    width: '100%',
    marginVertical: 25,
  },
  iconButton: {
    width: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconButtonContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    flex: 1,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  primaryButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  primaryButtonText: {
    fontFamily: fontNames.medium,
    fontSize: 20,
    color: 'white',
    marginTop: 2,
  },
  prevIcon: {
    transform: [{ rotate: '180deg' }],
  },
  skipText: {
    fontFamily: fontNames.regular,
    fontSize: 16,
  },
});
