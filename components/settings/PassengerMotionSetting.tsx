import { Pressable } from 'react-native';

import { Feather } from '@expo/vector-icons';
import { useAtom } from 'jotai/react';
import Toggle from 'react-native-toggle-input';

import { ThemedText, ThemedView } from '@/components';
import { useColors } from '@/hooks';
import { passengerMotionCuesEnabled } from '@/jotai/atoms';
import { styles } from '@/styles/screens/settings.styles';

export function PassengerMotionSetting() {
  const { textColor, primaryColor, cardColor, iconColor } = useColors();
  const [passengerMotionCuesEnabledValue, setPassengerMotionCuesEnabledValue] =
    useAtom(passengerMotionCuesEnabled);
  const togglePassengerMotionCuesSwitch = () =>
    setPassengerMotionCuesEnabledValue((value) => !value);

  function renderIconTextContainer() {
    return (
      <ThemedView
        style={[styles.iconTextContainer, { alignItems: 'flex-start' }]}
      >
        <Feather
          name="navigation"
          size={24}
          color={iconColor}
          style={styles.iconStyle}
        />
        <ThemedView style={{ backgroundColor: 'transparent' }}>
          <ThemedText
            type="defaultSemiBold"
            style={[styles.itemText, { backgroundColor: cardColor }]}
          >
            نقاط ثبات القراءة:
          </ThemedText>
          <ThemedText style={{ fontSize: 13, opacity: 0.7 }}>
            للراكب فقط — لا تستخدم أثناء القيادة
          </ThemedText>
        </ThemedView>
      </ThemedView>
    );
  }
  return (
    <Pressable
      style={[
        styles.settingsSection,
        { borderColor: textColor, backgroundColor: cardColor },
      ]}
      onPress={togglePassengerMotionCuesSwitch}
      accessibilityRole="button"
      accessibilityLabel="تفعيل نقاط ثبات القراءة للراكب"
      accessibilityHint="هذه الميزة مخصصة للراكب فقط وليست للاستخدام أثناء القيادة"
      accessibilityState={{ checked: passengerMotionCuesEnabledValue }}
    >
      {renderIconTextContainer()}
      <Toggle
        color={primaryColor}
        size={40}
        circleColor={primaryColor}
        toggle={passengerMotionCuesEnabledValue}
        setToggle={togglePassengerMotionCuesSwitch}
        aria-checked={passengerMotionCuesEnabledValue}
        aria-label="نقاط ثبات القراءة للراكب"
        accessibilityLabel="تبديل نقاط ثبات القراءة للراكب"
        accessibilityState={{ checked: passengerMotionCuesEnabledValue }}
      />
    </Pressable>
  );
}
