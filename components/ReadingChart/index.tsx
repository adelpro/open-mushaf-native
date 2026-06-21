import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Pressable,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  useWindowDimensions,
  View,
} from 'react-native';

import Svg, { Line, Rect, Text as SvgText } from 'react-native-svg';

import { Colors } from '@/constants';
import {
  BAR_GAP,
  BAR_RADIUS,
  BAR_WIDTH,
  CHART_PADDING,
  CHART_PERIODS,
  GRID_RATIOS,
  TOOLTIP_HEADROOM,
} from '@/constants/readingChart';
import { ChartMetric, GroupBy, useColors, useReadingChartData } from '@/hooks';
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
  const { primaryColor, textColor, cardColor } = useColors();
  const colorScheme = useColorScheme();
  // The selected-metric label sits on the brand-color fill, so we need the
  // opposite-theme text color for contrast (avoids the white-on-white trap in
  // light themes and dark-on-dark in dark themes).
  const onPrimaryTextColor =
    Colors[colorScheme === 'dark' ? 'light' : 'dark'].text;
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const [metric, setMetric] = useState<ChartMetric>('hizbs');
  const [groupBy, setGroupBy] = useState<GroupBy>('day');
  const {
    data,
    maxValue,
    total,
    avg,
    period,
    periodIndex,
    setPeriodIndex,
    getValue,
  } = useReadingChartData(metric, groupBy);

  const isPages = metric === 'pages';
  const unitLabel = isPages ? 'صفحة' : 'حزب';
  const totalLabel = isPages ? 'إجمالي الصفحات' : 'إجمالي الأحزاب';
  // "per day" / "per week" — matches the granularity the user is looking at.
  const avgSuffix = groupBy === 'week' ? 'أسبوع' : 'يوم';

  const [selectedBar, setSelectedBar] = useState<number>(period - 1);
  const scrollRef = useRef<ScrollView>(null);

  // Layout math uses `data.length` (the number of bars we're actually
  // rendering) so that the per-bar gap is consistent regardless of whether
  // the bars are daily or weekly.
  const { chartHeight, drawableHeight, barGap, barOffset, svgWidth } =
    useMemo(() => {
      const barCount = data.length;
      const height = Math.max(screenHeight * 0.25, 180);
      const width = Math.min(screenWidth - 64, 600);
      const scrollable = width - CHART_PADDING.left;
      const gap =
        barCount <= 7
          ? (scrollable - barCount * BAR_WIDTH) / (barCount + 1)
          : BAR_GAP;
      const offset = barCount <= 7 ? gap : 0;
      const drawable = height - TOOLTIP_HEADROOM - CHART_PADDING.bottom;
      const svg =
        Math.max(
          width,
          CHART_PADDING.left +
            barCount * (BAR_WIDTH + gap) +
            CHART_PADDING.right,
        ) - CHART_PADDING.left;
      return {
        chartHeight: height,
        drawableHeight: drawable,
        barGap: gap,
        barOffset: offset,
        svgWidth: svg,
      };
    }, [screenWidth, screenHeight, data.length]);

  const paddingTop = TOOLTIP_HEADROOM;

  // Auto-scroll to the most recent bar after the data settles (period change
  // or first paint). Replaces the old onContentSizeChange handler that fired
  // on every nested layout change.
  useEffect(() => {
    const handle = requestAnimationFrame(() => {
      scrollRef.current?.scrollToEnd({ animated: false });
    });
    return () => cancelAnimationFrame(handle);
  }, [period]);

  const selectedData = selectedBar !== null ? data[selectedBar] : null;
  const selectedValue = selectedData
    ? isPages
      ? getValue(selectedData).toString()
      : getValue(selectedData).toFixed(1)
    : '';

  // Show the empty state when *all* bars in the current window are zero,
  // not just when the sum is zero (a single 0.1 hizb day would otherwise
  // hide the message).
  const hasAnyReading = data.some((d) => getValue(d) > 0);

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
                  {
                    color: metric === m ? onPrimaryTextColor : primaryColor,
                  },
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
            المعدل: {isPages ? avg.toFixed(0) : avg.toFixed(1)} {unitLabel}/
            {avgSuffix}
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

      {period > 7 && (
        <ThemedView style={[styles.groupByContainer, bg]}>
          <View style={[styles.groupByToggle, { borderColor: primaryColor }]}>
            {(['day', 'week'] as GroupBy[]).map((g) => (
              <TouchableOpacity
                key={g}
                onPress={() => setGroupBy(g)}
                style={[
                  styles.groupByBtn,
                  groupBy === g && { backgroundColor: primaryColor },
                ]}
                accessibilityRole="button"
                accessibilityLabel={g === 'day' ? 'عرض يومي' : 'عرض أسبوعي'}
                accessibilityState={{ selected: groupBy === g }}
              >
                <ThemedText
                  style={[
                    styles.groupByBtnText,
                    {
                      color: groupBy === g ? onPrimaryTextColor : primaryColor,
                    },
                  ]}
                >
                  {g === 'day' ? 'يومي' : 'أسبوعي'}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        </ThemedView>
      )}

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
                    fill={primaryColor}
                    opacity={selectedBar === i ? 1 : 0.25}
                  />
                );
              })}
            </Svg>

            <View style={[styles.touchLayer, { height: chartHeight }]}>
              {data.map((d, i) => {
                const val = getValue(d);
                // Skip empty days so a tap on a zero-value bar never sets a
                // "selection" that produces no visible feedback.
                if (val <= 0) return null;
                const x = barOffset + i * (BAR_WIDTH + barGap);
                const barH = (val / maxValue) * drawableHeight;
                const barTop = paddingTop + drawableHeight - barH;
                // Flip the tooltip below the bar when there isn't enough room
                // above the bar to fit it under the y-axis labels.
                const flipBelow = barTop < TOOLTIP_HEADROOM;
                const tooltipTop = flipBelow ? barTop + 8 : barTop - 42;
                return (
                  <Pressable
                    key={i}
                    accessibilityRole="button"
                    accessibilityLabel={`${getValue(d)} ${unitLabel} في ${formatLabel(d.date, period)}`}
                    style={{
                      position: 'absolute',
                      ...getPosStyle(x - BAR_GAP / 2),
                      top: 0,
                      width: BAR_WIDTH + BAR_GAP,
                      height: chartHeight,
                    }}
                    onPress={() => handleBarPress(i)}
                  >
                    {selectedBar === i && (
                      <View
                        style={[
                          styles.tooltip,
                          {
                            top: tooltipTop,
                            backgroundColor: primaryColor,
                          },
                        ]}
                      >
                        <ThemedText
                          style={[
                            styles.tooltipText,
                            { color: onPrimaryTextColor },
                          ]}
                        >
                          {selectedValue}
                        </ThemedText>
                        <View
                          style={[
                            flipBelow
                              ? styles.tooltipArrowUp
                              : styles.tooltipArrow,
                            flipBelow
                              ? { borderBottomColor: primaryColor }
                              : { borderTopColor: primaryColor },
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
                const labelWidth = BAR_WIDTH + barGap;
                const labelX = x - barGap / 2;
                return (
                  <ThemedText
                    key={i}
                    numberOfLines={1}
                    style={[
                      styles.xLabel,
                      {
                        ...getPosStyle(labelX),
                        width: labelWidth,
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

      {!hasAnyReading && (
        <ThemedText
          style={[styles.emptyText, { color: textColor, opacity: 0.4 }]}
        >
          لا توجد بيانات قراءة بعد
        </ThemedText>
      )}
    </ThemedView>
  );
}
