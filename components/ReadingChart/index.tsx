import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  LayoutChangeEvent,
  Pressable,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  useWindowDimensions,
  View,
} from 'react-native';

import {
  ReadingChartBars,
  ReadingChartYAxis,
} from '@/components/svg/ReadingChartSvg';
import { Colors } from '@/constants';
import {
  BAR_GAP,
  BAR_WIDTH,
  CHART_PADDING,
  CHART_PERIODS,
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
 * Maps reading outputs (pages/hizbs) against custom date vectors using a
 * `@shopify/react-native-skia` Canvas to provide a responsive bar-chart
 * visualization of completion timelines.
 *
 * @returns An interactive chart wrapped in a horizontal scroll context.
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
    effectiveAvg,
    recordsWithData,
    period,
    periodIndex,
    setPeriodIndex,
    getValue,
  } = useReadingChartData(metric, groupBy);

  const isPages = metric === 'pages';
  const unitLabel = isPages ? 'صفحة' : 'حزب';
  const totalLabel = isPages ? 'إجمالي الصفحات' : 'إجمالي الأحزاب';
  // "per day" / "per week" / "per month" — matches the granularity the user
  // is looking at.
  const avgSuffix =
    groupBy === 'month' ? 'شهر' : groupBy === 'week' ? 'أسبوع' : 'يوم';
  // When grouping the bar count doesn't match the day window exactly
  // (e.g. 30 days → 5 weekly buckets, 90 days → 3 monthly buckets). Show
  // the actual bucket count so the user can see why the chart has N bars.
  const periodLabelSuffix =
    groupBy === 'month'
      ? `في آخر ${data.length} ${data.length === 1 ? 'شهر' : 'أشهر'}`
      : groupBy === 'week'
        ? `في آخر ${data.length} ${data.length === 1 ? 'أسبوع' : 'أسابيع'}`
        : `في ${CHART_PERIODS[periodIndex].label}`;

  const [selectedBar, setSelectedBar] = useState<number>(period - 1);
  const scrollRef = useRef<ScrollView>(null);

  // Measure the chart wrapper's actual width so we can center the bars in
  // the *visible* area. `screenWidth - 64` is a stale proxy that drifts from
  // the real wrapper width (which is `width: '90%'` of the screen, capped at
  // 640) — the two can differ by tens of px and leave the SVG left-shifted
  // inside the wider ScrollView.
  const [chartWidth, setChartWidth] = useState(0);
  const onChartLayout = useCallback((e: LayoutChangeEvent) => {
    setChartWidth(e.nativeEvent.layout.width);
  }, []);

  // Layout math uses `data.length` (the number of bars we're actually
  // rendering) so that the per-bar gap is consistent regardless of whether
  // the bars are daily or weekly. The cluster is centered when there are
  // 7 or fewer bars; otherwise the bars use a fixed gap and the chart
  // scrolls horizontally. svgWidth is the actual content width of the
  // ScrollView so the SVG always fills it — otherwise the centered bars
  // appear shifted to the left of the visible area.
  const { chartHeight, drawableHeight, barGap, barOffset, svgWidth } =
    useMemo(() => {
      const barCount = data.length;
      const height = Math.max(screenHeight * 0.25, 180);
      // chartWidth is 0 until onChartLayout fires; fall back to screenWidth
      // so the chart still renders on the first paint.
      const visible =
        (chartWidth > 0 ? chartWidth : Math.min(screenWidth, 600)) -
        CHART_PADDING.left;
      const gap = BAR_GAP;
      const totalBarSpace =
        barCount * BAR_WIDTH + Math.max(0, barCount - 1) * gap;
      // Center bars in the visible area when they fit; otherwise anchor
      // them to the left so the user can scroll to see the rest.
      const fitsInVisible = totalBarSpace <= visible;
      const offset = fitsInVisible ? (visible - totalBarSpace) / 2 : 0;
      const drawable = height - TOOLTIP_HEADROOM - CHART_PADDING.bottom;
      // SVG canvas = the wider of (visible area, totalBarSpace). Equal to
      // `visible` when bars fit (centered, no scroll); wider than visible
      // when bars overflow (left-anchored, horizontal scroll).
      const svg = Math.max(visible, totalBarSpace);
      return {
        chartHeight: height,
        drawableHeight: drawable,
        barGap: gap,
        barOffset: offset,
        svgWidth: svg,
      };
    }, [chartWidth, screenWidth, screenHeight, data.length]);

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
  // `recordsWithData` counts the underlying daily slots that have a real
  // record, regardless of the bar value. Lets us distinguish "user has
  // been tracking for 22 days inside a 90-day window" from "user read 0
  // on every tracked day", and drives the tracking-start caption.
  const isPartialWindow =
    groupBy === 'day' && recordsWithData > 0 && recordsWithData < period;

  const handlePeriodChange = useCallback(
    (index: number) => {
      setPeriodIndex(index);
      const newPeriod = CHART_PERIODS[index].days;
      // The group-by toggle is hidden when the period is 7 days or less, so
      // a stale `groupBy === 'week'` selection (left over from 30/90-day
      // views) would collapse every bar into one. Force daily for the
      // narrowest window so the chart stays meaningful.
      if (newPeriod <= 7) setGroupBy('day');
      // The monthly option is hidden outside the 90-day view; if the user
      // narrows the window with `month` still selected, drop back to weekly
      // so the chart stays readable.
      else if (newPeriod < 90 && groupBy === 'month') setGroupBy('week');
      setSelectedBar(newPeriod - 1);
    },
    [setPeriodIndex, groupBy],
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
          {totalLabel} {periodLabelSuffix}
        </ThemedText>
        {total > 0 && (
          <ThemedText
            style={[styles.avgLabel, { color: textColor, opacity: 0.4 }]}
          >
            المعدل:{' '}
            {isPages ? effectiveAvg.toFixed(0) : effectiveAvg.toFixed(1)}{' '}
            {unitLabel}/{avgSuffix}
          </ThemedText>
        )}
        {isPartialWindow && (
          <ThemedText
            style={[styles.avgLabel, { color: textColor, opacity: 0.4 }]}
          >
            بدأ التتبع قبل {recordsWithData} يوماً
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
            {(['day', 'week', 'month'] as GroupBy[])
              // Monthly is only meaningful when the window can fit at least
              // two full 30-day buckets, so the option is hidden outside the
              // 90-day view (no orphan state on a 1-bar "month" view).
              .filter((g) => g !== 'month' || period === 90)
              .map((g) => (
                <TouchableOpacity
                  key={g}
                  onPress={() => setGroupBy(g)}
                  style={[
                    styles.groupByBtn,
                    groupBy === g && { backgroundColor: primaryColor },
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel={
                    g === 'day'
                      ? 'عرض يومي'
                      : g === 'week'
                        ? 'عرض أسبوعي'
                        : 'عرض شهري'
                  }
                  accessibilityState={{ selected: groupBy === g }}
                >
                  <ThemedText
                    style={[
                      styles.groupByBtnText,
                      {
                        color:
                          groupBy === g ? onPrimaryTextColor : primaryColor,
                      },
                    ]}
                  >
                    {g === 'day' ? 'يومي' : g === 'week' ? 'أسبوعي' : 'شهري'}
                  </ThemedText>
                </TouchableOpacity>
              ))}
          </View>
        </ThemedView>
      )}

      <ThemedView style={[styles.chartWrapper, bg]} onLayout={onChartLayout}>
        <ReadingChartYAxis
          height={chartHeight}
          drawableHeight={drawableHeight}
          paddingTop={paddingTop}
          maxValue={maxValue}
          textColor={textColor}
        />

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
            <ReadingChartBars
              width={svgWidth}
              height={chartHeight}
              drawableHeight={drawableHeight}
              paddingTop={paddingTop}
              barOffset={barOffset}
              data={
                data as unknown as Parameters<
                  typeof ReadingChartBars
                >[0]['data']
              }
              getValue={
                getValue as unknown as Parameters<
                  typeof ReadingChartBars
                >[0]['getValue']
              }
              maxValue={maxValue}
              primaryColor={primaryColor}
              textColor={textColor}
              selectedBar={selectedBar}
              groupBy={groupBy}
            />

            <View style={[styles.touchLayer, { height: chartHeight }]}>
              {data.map((d, i) => {
                const val = getValue(d);
                // Skip empty days so a tap on a zero-value bar never sets a
                // "selection" that produces no visible feedback. Untracked
                // days are skipped too — there's no value to show in the
                // tooltip, and tapping a placeholder would just confuse.
                if (val <= 0 || (!d.hasRecord && groupBy === 'day'))
                  return null;
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
                    accessibilityLabel={`${getValue(d)} ${unitLabel} في ${formatLabel(d, period, groupBy).primary}`}
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
                if (!shouldShowLabel(d.date, i, period, groupBy)) return null;
                const x = barOffset + i * (BAR_WIDTH + barGap);
                const labelWidth = BAR_WIDTH + barGap;
                const labelX = x - barGap / 2;
                const { primary, secondary } = formatLabel(d, period, groupBy);
                return (
                  <ThemedView
                    key={i}
                    style={[
                      styles.xLabelGroup,
                      { ...getPosStyle(labelX), width: labelWidth },
                    ]}
                  >
                    <ThemedText
                      numberOfLines={1}
                      style={[
                        styles.xLabel,
                        {
                          color: textColor,
                          fontSize: period <= 7 ? 10 : 9,
                        },
                      ]}
                    >
                      {primary}
                    </ThemedText>
                    {secondary && (
                      <ThemedText
                        numberOfLines={1}
                        style={[styles.xLabelSecondary, { color: textColor }]}
                      >
                        {secondary}
                      </ThemedText>
                    )}
                  </ThemedView>
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
