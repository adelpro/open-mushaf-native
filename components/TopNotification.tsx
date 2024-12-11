import { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';

import Animated, { SlideInUp, SlideOutUp } from 'react-native-reanimated';

import { ThemedText } from './ThemedText';

type Props = {
  show: boolean;
  text: string;
};
export default function TopNotification({ show, text }: Props) {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  if (!show) return null;

  return (
    <Animated.View
      entering={SlideInUp}
      exiting={SlideOutUp}
      style={styles.notification}
    >
      <ThemedText style={styles.notificationText}>text</ThemedText>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  notification: {
    position: 'absolute',
    top: 10,
    maxWidth: 300,
    width: '50%',
    height: 50,
    padding: 15,
    alignItems: 'center',
    zIndex: 10,
    borderRadius: 10,
    backgroundColor: '#F2F2F2',
    fontFamily: 'Amiri_400Regular',
    fontSize: 16,
  },
  notificationText: {
    textAlign: 'center',
    color: '#333333',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
