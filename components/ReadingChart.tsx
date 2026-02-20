import React, { useMemo, useState } from 'react';
import { StyleSheet, useWindowDimensions } from 'react-native';

import { useAtomValue } from 'jotai/react';
import Svg, { Line, Rect, Text as SvgText } from 'react-native-svg';

import { useColors } from '@/hooks/useColors';
import {
  DailyReadingRecord,
  dailyTrackerCompleted,
  readingHistory,
} from '@/jotai/atoms';
import { formatDateKey, getHizbText } from '@/utils/hizbProgress';

import SegmentedControl from './SegmentControl';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

const PERIODS = [7, 30, 90] as const;
const PERIOD_LABELS = ['٧ أيام', '٣٠ يوماً', '٩٠ يوماً'];

const CHART_PADDING_LEFT = 36;
const CHART_PADDING_RIGHT = 8;
const CHART_PADDING_TOP = 12;
const CHART_PADDING_BOTTOM = 28;

/** Generate a date key N days ago using the shared format. */
function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return formatDateKey(d);
}

/** Format a Date-string to a short label with day/month for disambiguation. */
function shortLabel(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getDate()}/${d.getMonth() + 1}`;
}

export default function ReadingChart() {
  const { primaryColor, textColor, cardColor } = useColors();
  const { width: screenWidth } = useWindowDimensions();
  const history = useAtomValue(readingHistory);
  const todayData = useAtomValue(dailyTrackerCompleted);

  const [periodIndex, setPeriodIndex] = useState(0);
  const period = PERIODS[periodIndex];

  const chartWidth = Math.min(screenWidth - 32, 600);
  const chartHeight = 180;

  const data = useMemo(() => {
    // Build a map of date→hizbsCompleted from history + today
    const map = new Map<string, number>();
    for (const entry of history) {
      map.set(entry.date, entry.hizbsCompleted);
    }
    // Include today's live progress
    map.set(todayData.date, todayData.value);

    // Build array for the selected period
    const result: DailyReadingRecord[] = [];
    for (let i = period - 1; i >= 0; i--) {
      const dateStr = daysAgo(i);
      result.push({
        date: dateStr,
        hizbsCompleted: map.get(dateStr) ?? 0,
      });
    }
    return result;
  }, [history, todayData, period]);

  const maxValue = useMemo(
    () => Math.max(1, ...data.map((d) => d.hizbsCompleted)),
    [data],
  );

  const drawableWidth = chartWidth - CHART_PADDING_LEFT - CHART_PADDING_RIGHT;
  const drawableHeight = chartHeight - CHART_PADDING_TOP - CHART_PADDING_BOTTOM;
  const baseGap = period <= 7 ? 6 : period <= 30 ? 2 : 1;
  // Shrink gap to 0 if bars won't fit, then compute bar width to fill exactly
  const barGap =
    data.length + (data.length - 1) * baseGap > drawableWidth ? 0 : baseGap;
  const barWidth = Math.max(
    0.5,
    (drawableWidth - barGap * (data.length - 1)) / data.length,
  );

  // Decide how many x-axis labels to show so they don't overlap
  const labelEvery = period <= 7 ? 1 : period <= 30 ? 5 : 15;

  const totalHizbs = useMemo(
    () => data.reduce((sum, d) => sum + d.hizbsCompleted, 0),
    [data],
  );

  return (
    <ThemedView style={[styles.container, { backgroundColor: cardColor }]}>
      <ThemedView style={[styles.headerRow, { backgroundColor: cardColor }]}>
        <ThemedText style={styles.title}>إحصائيات القراءة</ThemedText>
      </ThemedView>

      <ThemedView
        style={[styles.segmentContainer, { backgroundColor: cardColor }]}
      >
        <SegmentedControl
          options={PERIOD_LABELS}
          initialSelectedIndex={periodIndex}
          activeColor={primaryColor}
          textColor={primaryColor}
          onSelectionChange={setPeriodIndex}
        />
      </ThemedView>

      <Svg
        width={chartWidth}
        height={chartHeight}
        style={{ overflow: 'hidden' }}
      >
        {/* Y-axis gridlines (deduplicated for small maxValue) */}
        {[...new Set([0.25, 0.5, 0.75, 1].map((r) => Math.round(maxValue * r)))]
          .map((label) => ({
            label,
            ratio: label / maxValue,
            y: CHART_PADDING_TOP + drawableHeight * (1 - label / maxValue),
          }))
          .map(({ label, y }) => (
            <React.Fragment key={label}>
              <Line
                x1={CHART_PADDING_LEFT}
                y1={y}
                x2={chartWidth - CHART_PADDING_RIGHT}
                y2={y}
                stroke={textColor}
                strokeOpacity={0.12}
                strokeWidth={0.5}
              />
              <SvgText
                x={CHART_PADDING_LEFT - 4}
                y={y + 4}
                textAnchor="end"
                fontSize={10}
                fill={textColor}
                opacity={0.5}
              >
                {label}
              </SvgText>
            </React.Fragment>
          ))}

        {/* Baseline */}
        <Line
          x1={CHART_PADDING_LEFT}
          y1={CHART_PADDING_TOP + drawableHeight}
          x2={chartWidth - CHART_PADDING_RIGHT}
          y2={CHART_PADDING_TOP + drawableHeight}
          stroke={textColor}
          strokeOpacity={0.2}
          strokeWidth={1}
        />

        {/* Bars */}
        {data.map((d, i) => {
          const x = CHART_PADDING_LEFT + i * (barWidth + barGap);
          const barH = (d.hizbsCompleted / maxValue) * drawableHeight;
          const y = CHART_PADDING_TOP + drawableHeight - barH;

          return (
            <React.Fragment key={i}>
              <Rect
                x={x}
                y={y}
                width={barWidth}
                height={Math.max(barH, 0)}
                rx={barWidth > 4 ? 3 : 1}
                fill={primaryColor}
                opacity={d.hizbsCompleted > 0 ? 0.85 : 0.15}
              />
              {/* X-axis label */}
              {i % labelEvery === 0 && (
                <SvgText
                  x={x + barWidth / 2}
                  y={CHART_PADDING_TOP + drawableHeight + 16}
                  textAnchor="middle"
                  fontSize={9}
                  fill={textColor}
                  opacity={0.5}
                >
                  {shortLabel(d.date)}
                </SvgText>
              )}
            </React.Fragment>
          );
        })}
      </Svg>

      <ThemedText style={[styles.summaryText, { color: primaryColor }]}>
        {totalHizbs > 0
          ? `المجموع: ${Number.isInteger(totalHizbs) ? getHizbText(totalHizbs) : `${totalHizbs.toFixed(1)} حزباً`} في ${PERIOD_LABELS[periodIndex]}`
          : 'لا توجد بيانات قراءة بعد'}
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '90%',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    alignItems: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 8,
    width: '100%',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  segmentContainer: {
    width: '100%',
    marginBottom: 12,
  },
  summaryText: {
    marginTop: 8,
    fontSize: 14,
    fontFamily: 'Tajawal_400Regular',
  },
});
