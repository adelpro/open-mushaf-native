import React, { useCallback, useRef, useState } from 'react';
import {
  Pressable,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';

import Svg, { Line, Rect, Text as SvgText } from 'react-native-svg';

import {
  BAR_GAP,
  BAR_RADIUS,
  BAR_WIDTH,
  CHART_PADDING,
  CHART_PERIODS,
  GRID_RATIOS,
} from '@/constants/readingChart';
import { ChartMetric, useColors, useReadingChartData } from '@/hooks';
import { formatLabel, getPosStyle, shouldShowLabel } from '@/utils';

import { SegmentedControl } from '../SegmentControl';
import { ThemedText } from '../ThemedText';
import { ThemedView } from '../ThemedView';
import { styles } from './styles';

/**
 * The primary statistical charting component driving the User's daily read tracking.
 * Maps reading outputs (pages/hizbs) against custom date vectors using `react-native-svg` plotting
 * to provide a responsive bar-chart visualization of completion timelines.
 *
 * @returns An interactive `<Svg>` map and scroll context wrapped safely.
 */
export function ReadingChart() {
  const { primaryColor, textColor, cardColor, tabIconDefaultColor } =
    useColors();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const [metric, setMetric] = useState<ChartMetric>('hizbs');
  const {
    data,
    maxValue,
    total,
    dailyAvg,
    period,
    periodIndex,
    setPeriodIndex,
    getValue,
  } = useReadingChartData(metric);

  const isPages = metric === 'pages';
  const unitLabel = isPages ? 'صفحة' : 'حزب';
  const totalLabel = isPages ? 'إجمالي الصفحات' : 'إجمالي الأحزاب';

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
    ? isPages
      ? getValue(selectedData).toString()
      : getValue(selectedData).toFixed(1)
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
        <View style={[styles.metricToggle, { borderColor: primaryColor }]}>
          {(['hizbs', 'pages'] as ChartMetric[]).map((m) => (
            <TouchableOpacity
              key={m}
              onPress={() => setMetric(m)}
              style={[
                styles.metricBtn,
                metric === m && { backgroundColor: primaryColor },
              ]}
            >
              <ThemedText
                style={[
                  styles.metricBtnText,
                  { color: metric === m ? '#fff' : primaryColor },
                ]}
              >
                {m === 'hizbs' ? 'أحزاب' : 'صفحات'}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </View>
      </ThemedView>

      <ThemedView style={[styles.statsContainer, bg]}>
        <ThemedText style={[styles.bigNumber, { color: primaryColor }]}>
          {isPages ? total : total.toFixed(1)}
        </ThemedText>
        <ThemedText
          style={[styles.statsLabel, { color: textColor, opacity: 0.6 }]}
        >
          {totalLabel} في {CHART_PERIODS[periodIndex].label}
        </ThemedText>
        {total > 0 && (
          <ThemedText
            style={[styles.avgLabel, { color: textColor, opacity: 0.4 }]}
          >
            المعدل: {isPages ? dailyAvg.toFixed(0) : dailyAvg.toFixed(1)}{' '}
            {unitLabel}/يوم
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
                const val = getValue(d);
                if (val <= 0) return null;
                const x = barOffset + i * (BAR_WIDTH + barGap);
                const barH = (val / maxValue) * drawableHeight;
                return (
                  <Rect
                    key={i}
                    x={x}
                    y={paddingTop + drawableHeight - barH}
                    width={BAR_WIDTH}
                    height={Math.max(barH, 0)}
                    rx={BAR_RADIUS}
                    fill={
                      selectedBar === i ? primaryColor : tabIconDefaultColor
                    }
                    opacity={selectedBar === i ? 1 : 0.25}
                  />
                );
              })}
            </Svg>

            <View style={[styles.touchLayer, { height: chartHeight }]}>
              {data.map((d, i) => {
                const val = getValue(d);
                const x = barOffset + i * (BAR_WIDTH + barGap);
                const barH = (val / maxValue) * drawableHeight;
                const barTop = paddingTop + drawableHeight - barH;
                return (
                  <Pressable
                    key={i}
                    style={{
                      position: 'absolute',
                      ...getPosStyle(x - BAR_GAP / 2),
                      top: 0,
                      width: BAR_WIDTH + BAR_GAP,
                      height: chartHeight,
                    }}
                    onPress={() => handleBarPress(i)}
                  >
                    {selectedBar === i && val > 0 && (
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
                        ...getPosStyle(x),
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

      {total === 0 && (
        <ThemedText
          style={[styles.emptyText, { color: textColor, opacity: 0.4 }]}
        >
          لا توجد بيانات قراءة بعد
        </ThemedText>
      )}
    </ThemedView>
  );
}
