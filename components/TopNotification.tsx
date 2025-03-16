import { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';

import Animated, { SlideInUp, SlideOutUp } from 'react-native-reanimated';

import { ThemedText } from './ThemedText';

type Props = {
  show: boolean;
  text: string;
};
export default function TopNotification({ show, text }: Props) {
  const [isVisible, setIsVisible] = useState(true);
  useEffect(() => {
    // When show becomes true, set isVisible to true
    if (show) {
      setIsVisible(true);

      // Set a timer to hide the notification after 3 seconds
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 3000);

      // Clear the timer if the component unmounts or show becomes false
      return () => clearTimeout(timer);
    }
  }, [show]);

  if (!isVisible) return null;

  if (!show) return null;

  return (
    <Animated.View
      entering={SlideInUp}
      exiting={SlideOutUp}
      style={styles.notification}
    >
      <ThemedText style={styles.notificationText}>{text}</ThemedText>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  notification: {
    position: 'absolute',
    justifyContent: 'center',
    alignSelf: 'center',
    top: 10,
    maxWidth: 180,
    width: '50%',
    height: 50,
    padding: 5,
    alignItems: 'center',
    zIndex: 10,
    borderRadius: 2,
    backgroundColor: '#333333',
    opacity: 0.8,
  },
  notificationText: {
    textAlign: 'center',
    color: '#F2F2F2',
    fontFamily: 'Tajawal_400Regular',
    fontSize: 16,
    paddingHorizontal: 10,
  },
});
