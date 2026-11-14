import { Pressable } from 'react-native';

import { Feather } from '@expo/vector-icons';
import { useAtom } from 'jotai/react';
import Toggle from 'react-native-toggle-input';

import { ThemedText, ThemedView } from '@/components';
import { useColors } from '@/hooks';
import { showTrackerNotification } from '@/jotai/atoms';
import { styles } from '@/styles/screens/settings.styles';

export function TrackerNotificationSetting() {
  const { textColor, primaryColor, cardColor, iconColor } = useColors();
  const [showTrackerNotificationValue, setShowTrackerNotificationValue] =
    useAtom(showTrackerNotification);
  const toggleTrackerSwitch = () =>
    setShowTrackerNotificationValue((value) => !value);

  function renderIconTextContainer() {
    return (
      <ThemedView style={styles.iconTextContainer}>
        <Feather
          name="bell"
          size={24}
          color={iconColor}
          style={styles.iconStyle}
        />
        <ThemedText
          type="defaultSemiBold"
          style={[styles.itemText, { backgroundColor: cardColor }]}
        >
          تنبيه الورد اليومي:
        </ThemedText>
      </ThemedView>
    );
  }
  return (
    <Pressable
      style={[
        styles.settingsSection,
        { borderColor: textColor, backgroundColor: cardColor },
      ]}
      onPress={toggleTrackerSwitch}
      accessibilityRole="button"
      accessibilityLabel="تفعيل تنبيه إتمام الورد اليومي"
      accessibilityHint="اضغط لتفعيل أو تعطيل تنبه إتمام الورد اليومي"
      accessibilityState={{
        selected: showTrackerNotificationValue,
      }}
    >
      {renderIconTextContainer()}
      <Toggle
        color={primaryColor}
        size={40}
        circleColor={primaryColor}
        toggle={showTrackerNotificationValue}
        setToggle={toggleTrackerSwitch}
        aria-checked={showTrackerNotificationValue}
        aria-label="إظهار تنبيه إتمام الحزب اليومي"
        accessibilityLabel="تنبيه إتمام الحزب اليومي"
        accessibilityState={{ checked: showTrackerNotificationValue }}
      />
    </Pressable>
  );
}
