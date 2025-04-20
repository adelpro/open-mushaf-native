import { StyleSheet, View } from 'react-native';

import Animated, { SlideInUp, SlideOutUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useNotification } from './NotificationProvider';
import { ThemedText } from './ThemedText';

export default function Notification() {
  const { notifications } = useNotification();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[styles.container, { paddingTop: insets.top }]}
      pointerEvents="box-none"
    >
      {notifications.map((notification, index) => (
        <Animated.View
          key={notification.id}
          entering={SlideInUp}
          exiting={SlideOutUp}
          style={[
            styles.notification,
            { top: 10 + index * 60 }, // Stack notifications with 40px spacing
          ]}
        >
          <ThemedText style={styles.notificationText}>
            {notification.text}
          </ThemedText>
        </Animated.View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    pointerEvents: 'box-none',
  },
  notification: {
    position: 'absolute',
    alignSelf: 'center',
    maxWidth: 320,
    width: '90%',
    minHeight: 50,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 5,
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
