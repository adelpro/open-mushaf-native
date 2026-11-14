import { Pressable } from 'react-native';

import { Feather } from '@expo/vector-icons';
import { useAtom } from 'jotai/react';
import Toggle from 'react-native-toggle-input';

import { ThemedText, ThemedView } from '@/components';
import { useColors } from '@/hooks';
import { flipSound } from '@/jotai/atoms';
import { styles } from '@/styles/screens/settings.styles';

export function FlipSoundSetting() {
  const { textColor, primaryColor, cardColor, iconColor } = useColors();
  const [isFlipSoundEnabled, setIsFlipSoundEnabled] = useAtom(flipSound);
  const toggleFlipSoundSwitch = () => setIsFlipSoundEnabled((value) => !value);

  function renderIconTextContainer() {
    return (
      <ThemedView style={styles.iconTextContainer}>
        <Feather
          name="volume-2"
          size={24}
          color={iconColor}
          style={styles.iconStyle}
        />
        <ThemedText
          type="defaultSemiBold"
          style={[styles.itemText, { backgroundColor: cardColor }]}
        >
          صوت قلب الصفحة:
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
      onPress={toggleFlipSoundSwitch}
      accessibilityRole="button"
      accessibilityLabel="تفعيل صوت قلب الصفحة"
      accessibilityHint="اضغط لتفعيل أو تعطيل صوت قلب الصفحة"
      accessibilityState={{ selected: isFlipSoundEnabled }}
    >
      {renderIconTextContainer()}
      <Toggle
        color={primaryColor}
        size={40}
        circleColor={primaryColor}
        toggle={isFlipSoundEnabled}
        setToggle={toggleFlipSoundSwitch}
        aria-checked={isFlipSoundEnabled}
        aria-label="صوت قلب الصفحة"
        accessibilityLabel="تبديل صوت قلب الصفحة"
        accessibilityState={{ checked: isFlipSoundEnabled }}
      />
    </Pressable>
  );
}
