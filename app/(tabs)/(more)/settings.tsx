import { useCallback, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';

import Slider from '@react-native-community/slider';
import Toggle from 'react-native-toggle-input';
import { useRecoilState } from 'recoil';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useColors } from '@/hooks/useColors';
import { flipSound, mushafContrast } from '@/recoil/atoms';

export default function SettingsScreen() {
  const [isFlipSoundEnabled, setIsFlipSoundEnabled] = useRecoilState(flipSound);

  const { textColor, backgroundColor, primaryColor, primaryLightColor } =
    useColors();
  const [mushafContrastValue, setMushafContrastValue] =
    useRecoilState(mushafContrast);

  const [tooltipOpacity] = useState(new Animated.Value(0));
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);

  const toggleSwitch = () => {
    setIsFlipSoundEnabled((previousState) => !previousState);
  };

  const showTooltip = useCallback(() => {
    setIsTooltipVisible(true);
    Animated.timing(tooltipOpacity, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [tooltipOpacity]);

  const hideTooltip = useCallback(() => {
    Animated.timing(tooltipOpacity, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setIsTooltipVisible(false);
    });
  }, [tooltipOpacity]);

  return (
    <ThemedView style={styles.container}>
      <Pressable
        style={[
          styles.settingsSection,
          { borderColor: textColor, backgroundColor },
        ]}
        onPress={toggleSwitch}
      >
        <ThemedText type="defaultSemiBold" style={styles.itemText}>
          صوت قلب الصفحة
        </ThemedText>
        <Toggle
          color={primaryColor}
          size={30}
          circleColor={primaryColor}
          toggle={isFlipSoundEnabled}
          setToggle={toggleSwitch}
          aria-checked={isFlipSoundEnabled}
          aria-label="صوت قلب الصفحة"
        />
      </Pressable>
      <ThemedView
        style={[
          styles.settingsSection,
          { display: 'flex', flexDirection: 'column' },
        ]}
      >
        <ThemedView
          style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'flex-start',
            alignItems: 'center',
            width: '100%',
          }}
        >
          <ThemedText type="defaultSemiBold" style={[styles.itemText]}>
            قيمة السطوع في الوضع الليلي
          </ThemedText>
          <ThemedText
            type="defaultSemiBold"
            style={[styles.sliderValue, { padding: 5 }]}
          >
            {`(${Number(mushafContrastValue * 100).toFixed(0)}%)`}
          </ThemedText>
        </ThemedView>

        <View style={styles.sliderContainer}>
          <Slider
            style={[styles.slider, { transform: [{ scaleX: -1 }] }]}
            minimumValue={0}
            maximumValue={1}
            step={0.01}
            value={mushafContrastValue}
            onValueChange={(value) => {
              setMushafContrastValue(value);
            }}
            onSlidingStart={showTooltip}
            onSlidingComplete={hideTooltip}
            minimumTrackTintColor={primaryLightColor}
            maximumTrackTintColor="#d3d3d3"
            thumbTintColor={primaryColor}
          />

          {isTooltipVisible && (
            <Animated.View
              style={[
                styles.tooltip,
                {
                  left: `${mushafContrastValue * 100}%`,
                  opacity: tooltipOpacity,
                  backgroundColor: primaryColor,
                },
              ]}
            >
              <Text style={styles.tooltipText}>
                {`${Number(mushafContrastValue * 100).toFixed(0)}%`}
              </Text>
            </Animated.View>
          )}
        </View>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  settingsSection: {
    width: '100%',
    maxWidth: 640,
    marginBottom: 20,
    alignSelf: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
    borderRadius: 5,
    borderColor: '#e0e0e0',
    elevation: 3,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  checkbox: {
    borderColor: '#4CAF50',
    borderWidth: 2,
    borderRadius: 5,
  },
  itemText: {
    fontSize: 22,
    fontFamily: 'Amiri_700Bold',
    paddingVertical: 10,
    textAlignVertical: 'center',
  },
  sliderValue: {
    fontSize: 22,
    fontFamily: 'Amiri_700Bold',
    textAlignVertical: 'center',
    paddingHorizontal: 10,
  },
  sliderContainer: {
    width: '100%',
    position: 'relative',
    maxWidth: 640,
  },
  slider: {
    width: '100%',
    height: 50,
    marginVertical: 10,
  },
  tooltip: {
    position: 'absolute',
    bottom: 60,
    transform: [{ translateX: -25 }],
    width: 50,
    paddingVertical: 5,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '0px 5px 5px rgba(0, 0, 0, 0.2)',
    elevation: 5,
  },
  tooltipText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
