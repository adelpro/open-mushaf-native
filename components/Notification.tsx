import { StyleSheet, View } from 'react-native';

import Animated, { SlideInUp, SlideOutUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import useNotificationStyles from '@/hooks/useNotificationStyles';

import { useNotification } from './NotificationProvider';
import { ThemedText } from './ThemedText';

export default function Notification() {
  const { notifications } = useNotification();
  const insets = useSafeAreaInsets();
  const notificationStyles = useNotificationStyles();

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top, pointerEvents: 'box-none' },
      ]}
    >
      {notifications.map((notification, index) => {
        // Get the style for this notification type
        const typeStyle = notificationStyles[notification.type || 'neutral'];

        return (
          <Animated.View
            key={notification.id}
            entering={SlideInUp}
            exiting={SlideOutUp}
            style={[
              styles.notification,
              { top: 10 + index * 20 }, // Stack notifications with 20px spacing
              // Apply type-specific styles
              {
                backgroundColor: typeStyle.backgroundColor,
                borderColor: typeStyle.borderColor,
                borderWidth: 2,
              },
            ]}
          >
            <ThemedText
              style={[styles.notificationText, { color: typeStyle.color }]}
            >
              {notification.text}
            </ThemedText>
          </Animated.View>
        );
      })}
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
    position: 'relative',
    alignSelf: 'center',
    maxWidth: 320,
    width: '90%',
    minHeight: 50,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 5,
    opacity: 0.9,
  },
  notificationText: {
    textAlign: 'center',
    fontFamily: 'Tajawal_400Regular',
    fontSize: 16,
    paddingHorizontal: 10,
  },
});
