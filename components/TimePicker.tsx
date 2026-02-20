import React, { useCallback, useEffect, useRef } from 'react';
import {
  FlatList,
  ListRenderItemInfo,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  View,
} from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { useColors } from '@/hooks/useColors';

const ITEM_HEIGHT = 44;
const VISIBLE_ITEMS = 5;
const PICKER_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;

type WheelProps = {
  /** Array of values to display */
  data: number[];
  /** Currently selected value */
  value: number;
  /** Callback when value changes */
  onChange: (value: number) => void;
  /** Format the displayed number (e.g. pad with zero) */
  formatLabel?: (value: number) => string;
};

/** Formats a number with leading zero */
const padZero = (n: number): string => n.toString().padStart(2, '0');

/** A single scrollable wheel column */
const Wheel = ({
  data,
  value,
  onChange,
  formatLabel = padZero,
}: WheelProps) => {
  const { primaryColor, textColor, cardColor } = useColors();
  const flatListRef = useRef<FlatList<number>>(null);
  const isMomentumScrolling = useRef(false);
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const initialIndex = data.indexOf(value);

  /** Clear any pending scroll timeout on unmount */
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  /** Selects the item closest to the current scroll offset */
  const selectFromOffset = useCallback(
    (offsetY: number) => {
      const index = Math.round(offsetY / ITEM_HEIGHT);
      const clampedIndex = Math.max(0, Math.min(index, data.length - 1));
      onChange(data[clampedIndex]);
    },
    [data, onChange],
  );

  /** When drag ends, wait briefly to see if momentum follows */
  const handleScrollEndDrag = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offsetY = event.nativeEvent.contentOffset.y;
      isMomentumScrolling.current = false;
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      scrollTimeoutRef.current = setTimeout(() => {
        scrollTimeoutRef.current = null;
        if (!isMomentumScrolling.current) {
          selectFromOffset(offsetY);
        }
      }, 100);
    },
    [selectFromOffset],
  );

  /** Tracks that a momentum phase has started */
  const handleMomentumScrollBegin = useCallback(() => {
    isMomentumScrolling.current = true;
  }, []);

  /** Selects the final snapped item after momentum ends */
  const handleMomentumScrollEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      isMomentumScrolling.current = false;
      selectFromOffset(event.nativeEvent.contentOffset.y);
    },
    [selectFromOffset],
  );

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<number>) => {
      const isSelected = item === value;
      return (
        <View style={styles.item}>
          <ThemedText
            style={[
              styles.itemText,
              { color: isSelected ? primaryColor : textColor },
              isSelected && styles.selectedText,
            ]}
          >
            {formatLabel(item)}
          </ThemedText>
        </View>
      );
    },
    [value, primaryColor, textColor, formatLabel],
  );

  const getItemLayout = useCallback(
    (_: unknown, index: number) => ({
      length: ITEM_HEIGHT,
      offset: ITEM_HEIGHT * index,
      index,
    }),
    [],
  );

  return (
    <View style={[styles.wheelContainer, { backgroundColor: cardColor }]}>
      {/* Selection highlight band */}
      <View
        style={[
          styles.selectionBand,
          {
            backgroundColor: primaryColor + '18',
            borderColor: primaryColor + '40',
          },
        ]}
        pointerEvents="none"
      />
      <FlatList
        ref={flatListRef}
        data={data}
        keyExtractor={(item) => item.toString()}
        renderItem={renderItem}
        getItemLayout={getItemLayout}
        initialScrollIndex={initialIndex >= 0 ? initialIndex : 0}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled={true}
        onScrollEndDrag={handleScrollEndDrag}
        onMomentumScrollBegin={handleMomentumScrollBegin}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        contentContainerStyle={{
          paddingVertical: ITEM_HEIGHT * Math.floor(VISIBLE_ITEMS / 2),
        }}
      />
    </View>
  );
};

type TimePickerProps = {
  /** Selected hour (0-23) */
  hour: number;
  /** Selected minute (0-59) */
  minute: number;
  /** Called when the user changes the time */
  onChange: (time: { hour: number; minute: number }) => void;
};

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = Array.from({ length: 60 }, (_, i) => i);

/** Custom scrollable time picker with hour and minute wheels */
const TimePicker = ({ hour, minute, onChange }: TimePickerProps) => {
  const { textColor } = useColors();

  const handleHourChange = useCallback(
    (h: number) => onChange({ hour: h, minute }),
    [minute, onChange],
  );

  const handleMinuteChange = useCallback(
    (m: number) => onChange({ hour, minute: m }),
    [hour, onChange],
  );

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <ThemedText style={[styles.label, { color: textColor }]}>
          الساعة
        </ThemedText>
        <ThemedText style={[styles.label, { color: textColor }]}>
          الدقيقة
        </ThemedText>
      </View>
      <View style={styles.wheelsRow}>
        <Wheel data={HOURS} value={hour} onChange={handleHourChange} />
        <ThemedText style={[styles.separator, { color: textColor }]}>
          :
        </ThemedText>
        <Wheel data={MINUTES} value={minute} onChange={handleMinuteChange} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 4,
  },
  label: {
    fontSize: 14,
    fontFamily: 'Tajawal_400Regular',
  },
  wheelsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  wheelContainer: {
    height: PICKER_HEIGHT,
    width: 80,
    borderRadius: 12,
    overflow: 'hidden',
  },
  selectionBand: {
    position: 'absolute',
    top: ITEM_HEIGHT * Math.floor(VISIBLE_ITEMS / 2),
    left: 0,
    right: 0,
    height: ITEM_HEIGHT,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    zIndex: 1,
  },
  item: {
    height: ITEM_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemText: {
    fontSize: 20,
    fontFamily: 'Tajawal_400Regular',
  },
  selectedText: {
    fontFamily: 'Tajawal_700Bold',
    fontSize: 22,
  },
  separator: {
    fontSize: 28,
    fontFamily: 'Tajawal_700Bold',
    marginHorizontal: 8,
  },
});

export default TimePicker;
