import { Pressable } from 'react-native';

import { Feather } from '@expo/vector-icons';
import { useAtom } from 'jotai/react';

import {
  SegmentedControlWithDisabled,
  ThemedText,
  ThemedView,
} from '@/components';
import { useColors } from '@/hooks';
import { hizbNotification } from '@/jotai/atoms';
import { styles } from '@/styles/screens/settings.styles';

export function HizbNotificationSetting() {
  const { primaryColor, cardColor, iconColor } = useColors();
  const notificationOptions = ['تعطيل', 'حزب', 'جزء'];
  const [HizbNotificationValue, setHizbNotificationValue] =
    useAtom(hizbNotification);
  const handleHizbNotificationValueChange = (value: number) =>
    setHizbNotificationValue(value === 1 || value === 2 ? value : 0);

  return (
    <ThemedView
      style={[
        styles.settingsSection,
        styles.columnSection,
        { backgroundColor: cardColor },
      ]}
    >
      <ThemedView style={[styles.fullWidthContainer, styles.iconTextContainer]}>
        <Feather
          name="bell"
          size={24}
          color={iconColor}
          style={styles.iconStyle}
        />
        <ThemedText type="defaultSemiBold" style={[styles.itemText]}>
          تفعيل التنبيهات:
        </ThemedText>
      </ThemedView>
      <Pressable style={styles.fullWidth} accessibilityRole="radiogroup">
        <SegmentedControlWithDisabled
          options={notificationOptions}
          initialSelectedIndex={HizbNotificationValue}
          activeColor={primaryColor}
          textColor={primaryColor}
          disabledTextColor={primaryColor}
          onSelectionChange={(index: number) =>
            handleHizbNotificationValueChange(index)
          }
        />
      </Pressable>
    </ThemedView>
  );
}
