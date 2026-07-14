import {
  Canvas,
  DashPathEffect,
  Group,
  Line,
  matchFont,
  RoundedRect,
  Text,
} from '@shopify/react-native-skia';

import {
  BAR_RADIUS,
  BAR_WIDTH,
  CHART_PADDING,
  GRID_RATIOS,
} from '@/constants/readingChart';
import { GroupBy } from '@/hooks';

// Skia doesn't expose `react-native-svg`'s `textAnchor` prop, so we measure
// each label width and shift the x by that amount to right-align the y-axis
// numbers the way the previous SVG layout did.
const Y_AXIS_FONT_SIZE = 10;

export type ChartDatum = {
  /** ISO-ish string or Date; only consulted by callers for grouping, not used
   *  here. Kept opaque so callers can pass their hook's datum type as-is. */
  date?: string;
  daysInBucket?: number;
  hasRecord?: boolean;
  [k: string]: unknown;
};

export type ReadingChartYAxisProps = {
  height: number;
  drawableHeight: number;
  paddingTop: number;
  maxValue: number;
  /** Resolved via `useColors().textColor` in the parent. */
  textColor: string;
};

/**
 * Y-axis numeric labels rendered on a Skia `<Canvas>`. Drop-in for the
 * previous `<Svg>` block that lived on the left of the chart wrapper.
 */
export function ReadingChartYAxis({
  height,
  drawableHeight,
  paddingTop,
  maxValue,
  textColor,
}: ReadingChartYAxisProps) {
  const font = matchFont({ fontSize: Y_AXIS_FONT_SIZE });

  return (
    <Canvas style={{ width: CHART_PADDING.left, height }}>
      {GRID_RATIOS.map((r) => {
        const label = (maxValue * r).toFixed(1);
        // Right-align: SVG `textAnchor="end"` → x is the right edge; Skia's
        // <Text> x is the left baseline. Shift by the measured width.
        const measured = font.measureText(label);
        const y = paddingTop + drawableHeight * (1 - r) + 4;
        return (
          <Text
            key={r}
            x={CHART_PADDING.left - 6 - measured.width}
            y={y}
            text={label}
            color={textColor}
            opacity={0.5}
            font={font}
          />
        );
      })}
    </Canvas>
  );
}

export type ReadingChartBarsProps = {
  width: number;
  height: number;
  drawableHeight: number;
  paddingTop: number;
  barOffset: number;
  data: ChartDatum[];
  /** `(datum) => number` — supplied by `useReadingChartData` in the parent. */
  getValue: (datum: ChartDatum) => number;
  maxValue: number;
  primaryColor: string;
  textColor: string;
  selectedBar: number | null;
  groupBy: GroupBy;
};

/**
 * Grid lines + bars for the daily-tracking chart. Drop-in for the inner
 * `<Svg>` block that lived inside the horizontal ScrollView.
 */
export function ReadingChartBars({
  width,
  height,
  drawableHeight,
  paddingTop,
  barOffset,
  data,
  getValue,
  maxValue,
  primaryColor,
  textColor,
  selectedBar,
  groupBy,
}: ReadingChartBarsProps) {
  return (
    <Canvas style={{ width, height }}>
      {/* Grid lines — dashed. Skia applies dash patterns via a child
          <DashPathEffect> wrapped in a <Group>. */}
      {GRID_RATIOS.map((r) => {
        const y = paddingTop + drawableHeight * (1 - r);
        return (
          <Group key={`grid-${r}`}>
            <DashPathEffect intervals={[8, 7]} />
            <Line
              p1={{ x: 0, y }}
              p2={{ x: width, y }}
              color={textColor}
              opacity={0.1}
              strokeWidth={0.5}
            />
          </Group>
        );
      })}

      {/* Bars */}
      {data.map((d, i) => {
        const val = getValue(d);
        // Partial trailing week (period % 7 !== 0): render at lower opacity +
        // dashed stroke so the user can see it's not a full 7-day week.
        const isPartial = d.daysInBucket !== undefined && d.daysInBucket < 7;
        // "No record" daily slot — faint dashed placeholder so the timeline
        // reads as "missing data" rather than "the user read 0".
        const isUntracked = !d.hasRecord && groupBy === 'day';
        if (val <= 0 && !isUntracked) return null;
        const fillOpacity =
          selectedBar === i ? 1 : isPartial ? 0.4 : isUntracked ? 0.25 : 0.85;
        const x = barOffset + i * BAR_WIDTH;
        const barH = (val / maxValue) * drawableHeight;
        const dashArray = isPartial ? [4, 3] : isUntracked ? [3, 3] : undefined;

        const filled = (
          <RoundedRect
            key={i}
            x={x}
            y={paddingTop + drawableHeight - barH}
            width={BAR_WIDTH}
            height={Math.max(barH, 0)}
            r={BAR_RADIUS}
            color={primaryColor}
            opacity={fillOpacity}
          />
        );

        if (dashArray === undefined) return filled;

        return (
          <Group key={i}>
            {filled}
            <DashPathEffect intervals={dashArray} />
            <RoundedRect
              x={x}
              y={paddingTop + drawableHeight - barH}
              width={BAR_WIDTH}
              height={Math.max(barH, 0)}
              r={BAR_RADIUS}
              color={primaryColor}
              style="stroke"
              strokeWidth={1}
            />
          </Group>
        );
      })}
    </Canvas>
  );
}
