import React, { useCallback, useRef, useState } from 'react';
import { Pressable, ScrollView, useWindowDimensions, View } from 'react-native';

import Svg, { Line, Rect, Text as SvgText } from 'react-native-svg';

import {
  BAR_GAP,
  BAR_RADIUS,
  BAR_WIDTH,
  CHART_PADDING,
  CHART_PERIODS,
  GRID_RATIOS,
  INACTIVE_BAR_COLOR,
} from '@/constants/readingChart';
import { useColors } from '@/hooks/useColors';
import { useReadingChartData } from '@/hooks/useReadingChartData';
import { formatLabel, shouldShowLabel } from '@/utils';

import SegmentedControl from '../SegmentControl';
import { ThemedText } from '../ThemedText';
import { ThemedView } from '../ThemedView';
import { styles } from './styles';

export default function ReadingChart() {
  const { primaryColor, textColor, cardColor } = useColors();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const {
    data,
    maxValue,
    totalHizbs,
    dailyAvg,
    period,
    periodIndex,
    setPeriodIndex,
  } = useReadingChartData();

  const [selectedBar, setSelectedBar] = useState<number>(period - 1);
  const scrollRef = useRef<ScrollView>(null);

  const chartHeight = Math.max(screenHeight * 0.25, 180);
  const visibleWidth = Math.min(screenWidth - 64, 600);
  const scrollableWidth = visibleWidth - CHART_PADDING.left;

  const maxRatio = Math.max(...GRID_RATIOS);
  const extra = maxRatio - 1;
  const paddingTop =
    Math.ceil((extra * (chartHeight - CHART_PADDING.bottom)) / (1 + extra)) + 8;
  const drawableHeight = chartHeight - paddingTop - CHART_PADDING.bottom;

  const barGap =
    period <= 7
      ? (scrollableWidth - period * BAR_WIDTH) / (period + 1)
      : BAR_GAP;
  const barOffset = period <= 7 ? barGap : 0;
  const svgWidth =
    Math.max(
      visibleWidth,
      CHART_PADDING.left + period * (BAR_WIDTH + barGap) + CHART_PADDING.right,
    ) - CHART_PADDING.left;

  const selectedData = selectedBar !== null ? data[selectedBar] : null;
  const selectedValue = selectedData
    ? selectedData.hizbsCompleted.toFixed(1)
    : '';

  const handlePeriodChange = useCallback(
    (index: number) => {
      setPeriodIndex(index);
      setSelectedBar(CHART_PERIODS[index].days - 1);
    },
    [setPeriodIndex],
  );

  const handleBarPress = useCallback((index: number) => {
    setSelectedBar(index);
  }, []);

  const bg = { backgroundColor: cardColor };

  return (
    <ThemedView style={[styles.container, bg]}>
      <ThemedView style={[styles.headerRow, bg]}>
        <ThemedText style={styles.title}>إحصائيات القراءة</ThemedText>
      </ThemedView>

      <ThemedView style={[styles.statsContainer, bg]}>
        <ThemedText style={[styles.bigNumber, { color: primaryColor }]}>
          {totalHizbs.toFixed(1)}
        </ThemedText>
        <ThemedText
          style={[styles.statsLabel, { color: textColor, opacity: 0.6 }]}
        >
          إجمالي الأحزاب في {CHART_PERIODS[periodIndex].label}
        </ThemedText>
        {totalHizbs > 0 && (
          <ThemedText
            style={[styles.avgLabel, { color: textColor, opacity: 0.4 }]}
          >
            المعدل: {dailyAvg.toFixed(1)} حزب/يوم
          </ThemedText>
        )}
      </ThemedView>

      <ThemedView style={[styles.segmentContainer, bg]}>
        <SegmentedControl
          options={CHART_PERIODS.map((p) => p.label)}
          initialSelectedIndex={periodIndex}
          activeColor={primaryColor}
          textColor={primaryColor}
          onSelectionChange={handlePeriodChange}
        />
      </ThemedView>

      <ThemedView style={[styles.chartWrapper, bg]}>
        <Svg
          width={CHART_PADDING.left}
          height={chartHeight}
          style={styles.yAxis}
        >
          {GRID_RATIOS.map((r) => (
            <SvgText
              key={r}
              x={CHART_PADDING.left - 6}
              y={paddingTop + drawableHeight * (1 - r) + 4}
              textAnchor="end"
              fontSize={10}
              fill={textColor}
              opacity={0.5}
            >
              {(maxValue * r).toFixed(1)}
            </SvgText>
          ))}
        </Svg>

        <ScrollView
          ref={scrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.chartScroll}
          contentContainerStyle={{ paddingRight: 8 }}
          onContentSizeChange={() =>
            scrollRef.current?.scrollToEnd({ animated: false })
          }
        >
          <ThemedView
            style={{ width: svgWidth, backgroundColor: 'transparent' }}
          >
            <Svg width={svgWidth} height={chartHeight}>
              {GRID_RATIOS.map((r) => {
                const y = paddingTop + drawableHeight * (1 - r);
                return (
                  <Line
                    key={r}
                    x1={0}
                    y1={y}
                    x2={svgWidth}
                    y2={y}
                    stroke={textColor}
                    strokeOpacity={0.1}
                    strokeWidth={0.5}
                    strokeDasharray="8 7"
                  />
                );
              })}
              {data.map((d, i) => {
                if (d.hizbsCompleted <= 0) return null;
                const x = barOffset + i * (BAR_WIDTH + barGap);
                const barH = (d.hizbsCompleted / maxValue) * drawableHeight;
                return (
                  <Rect
                    key={i}
                    x={x}
                    y={paddingTop + drawableHeight - barH}
                    width={BAR_WIDTH}
                    height={Math.max(barH, 0)}
                    rx={BAR_RADIUS}
                    fill={selectedBar === i ? primaryColor : INACTIVE_BAR_COLOR}
                    opacity={selectedBar === i ? 1 : 0.45}
                  />
                );
              })}
            </Svg>

            <View style={[styles.touchLayer, { height: chartHeight }]}>
              {data.map((d, i) => {
                const x = barOffset + i * (BAR_WIDTH + barGap);
                const barH = (d.hizbsCompleted / maxValue) * drawableHeight;
                const barTop = paddingTop + drawableHeight - barH;
                return (
                  <Pressable
                    key={i}
                    style={{
                      position: 'absolute',
                      right: x - BAR_GAP / 2,
                      top: 0,
                      width: BAR_WIDTH + BAR_GAP,
                      height: chartHeight,
                    }}
                    onPress={() => handleBarPress(i)}
                  >
                    {selectedBar === i && d.hizbsCompleted > 0 && (
                      <View
                        style={[
                          styles.tooltip,
                          {
                            top: Math.max(barTop - 42, 0),
                            backgroundColor: primaryColor,
                          },
                        ]}
                      >
                        <ThemedText style={styles.tooltipText}>
                          {selectedValue}
                        </ThemedText>
                        <View
                          style={[
                            styles.tooltipArrow,
                            { borderTopColor: primaryColor },
                          ]}
                        />
                      </View>
                    )}
                  </Pressable>
                );
              })}
            </View>

            <ThemedView
              style={[styles.xAxisRow, { backgroundColor: 'transparent' }]}
            >
              {data.map((d, i) => {
                if (!shouldShowLabel(d.date, i, period)) return null;
                const x = barOffset + i * (BAR_WIDTH + barGap);
                return (
                  <ThemedText
                    key={i}
                    numberOfLines={1}
                    style={[
                      styles.xLabel,
                      {
                        right: x,
                        width: BAR_WIDTH,
                        color: textColor,
                        fontSize: period <= 7 ? 10 : 9,
                      },
                    ]}
                  >
                    {formatLabel(d.date, period)}
                  </ThemedText>
                );
              })}
            </ThemedView>
          </ThemedView>
        </ScrollView>
      </ThemedView>

      {totalHizbs === 0 && (
        <ThemedText
          style={[styles.emptyText, { color: textColor, opacity: 0.4 }]}
        >
          لا توجد بيانات قراءة بعد
        </ThemedText>
      )}
    </ThemedView>
  );
}
