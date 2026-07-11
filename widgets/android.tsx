'use no memo';
import React from 'react';

import {
  FlexWidget,
  IconWidget,
  SvgWidget,
  TextWidget,
} from 'react-native-android-widget';
import type { HexColor } from 'react-native-android-widget';

import {
  buildRingSvg,
  clamp,
  layoutFor,
  surahToIconChar,
  withHexAlpha,
} from './android-layout';
import { Colors } from '../constants/Colors';

export type WidgetProps = {
  dailyGoal?: number;
  dailyCompleted?: number;
  currentPage?: number;
  currentSurahNumber?: number;
  currentHizbNumber?: number;
  colorScheme?: 'light' | 'dark';
  /**
   * Widget bounds in DP, provided by the host via `WidgetInfo`. Used to
   * switch between compact / normal / wide layouts. Optional — when
   * omitted (e.g. in tests or first render before the host reports a
   * size), we fall back to the `normal` layout.
   */
  widgetWidth?: number;
  widgetHeight?: number;
};

export default function AndroidWidget({
  dailyGoal = 1,
  dailyCompleted = 0,
  currentPage = 1,
  currentSurahNumber = 1,
  currentHizbNumber = 1,
  colorScheme = 'light',
  widgetWidth,
  widgetHeight,
}: WidgetProps) {
  const theme = colorScheme === 'dark' ? Colors.dark : Colors.light;
  const primaryColor = theme.primary as HexColor;
  const bgColor = theme.card as HexColor;
  const textColor = theme.text as HexColor;
  const subtextColor = theme.icon as HexColor;

  const trackColor = withHexAlpha(
    theme.text as HexColor,
    colorScheme === 'dark' ? '33' : '24',
  );

  const safeGoal = Math.max(1, Number.isFinite(dailyGoal) ? dailyGoal : 1);
  const safeCompleted = clamp(
    Number.isFinite(dailyCompleted) ? dailyCompleted : 0,
    0,
    safeGoal,
  );
  const progress = clamp((safeCompleted / safeGoal) * 100, 0, 100);

  const safePage = Math.max(1, Number.isFinite(currentPage) ? currentPage : 1);
  const safeHizb = Math.max(
    1,
    Number.isFinite(currentHizbNumber) ? currentHizbNumber : 1,
  );

  const compactWird = `${safeCompleted}/${safeGoal}`;

  const layout = layoutFor(widgetWidth, widgetHeight);

  const svgString = buildRingSvg({
    radius: layout.ringRadius,
    strokeWidth: layout.ringStroke,
    progress,
    trackColor,
    progressColor: primaryColor,
    label: `٪${Math.round(progress)}`,
    viewBox: layout.ringSize,
    fontSize: layout.ringFontSize,
  });

  return (
    <FlexWidget
      style={{
        height: 'match_parent',
        width: 'match_parent',
        flexDirection: 'column',
        backgroundColor: bgColor,
        alignItems: 'center',
        paddingHorizontal: 5,
        justifyContent: 'center',
      }}
      clickAction="OPEN_APP"
    >
      {/* Header Row */}
      <FlexWidget
        style={{
          flexDirection: 'row',
          marginBottom: 4,
          justifyContent: 'flex-end',
          alignItems: 'center',
          width: 'match_parent',
        }}
      >
        <TextWidget
          text="المصحف المفتوح"
          style={{
            fontSize: layout.headerFontSize,
            fontWeight: '700',
            color: textColor,
          }}
        />
        <IconWidget
          font="open_mushaf_icons"
          size={layout.headerFontSize}
          icon={''}
          style={{ marginHorizontal: 6, color: textColor }}
        />
      </FlexWidget>

      {/* Main row */}
      <FlexWidget
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: 'match_parent',
        }}
      >
        {/* Progress ring */}
        <FlexWidget
          style={{
            alignItems: 'center',
            justifyContent: 'center',
            margin: 5,
          }}
        >
          <FlexWidget
            style={{
              width: layout.ringSize,
              height: layout.ringSize,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <SvgWidget
              style={{ height: layout.ringSize, width: layout.ringSize }}
              svg={svgString}
            />
          </FlexWidget>
        </FlexWidget>

        {/* Surah Name — hidden in compact mode to save horizontal space */}
        {layout.showSurahGlyph && (
          <IconWidget
            font="open_mushaf_icons"
            size={layout.surahGlyphSize}
            icon={surahToIconChar(currentSurahNumber)}
            style={{ marginHorizontal: 6, color: textColor }}
          />
        )}

        {/* Content */}
        <FlexWidget
          style={{
            flexDirection: 'column',
          }}
        >
          <FlexWidget
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'flex-end',
              width: 'match_parent',
            }}
          >
            <TextWidget
              text={`الصفحة: ${safePage}`}
              style={{
                fontSize: layout.bodyFontSize,
                color: subtextColor,
              }}
            />
            <IconWidget
              font="open_mushaf_icons"
              size={layout.bodyFontSize}
              icon={''}
              style={{ marginHorizontal: 6, color: subtextColor }}
            />
          </FlexWidget>

          <FlexWidget
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'flex-end',
              width: 'match_parent',
            }}
          >
            <TextWidget
              text={`الحزب: ${safeHizb}`}
              style={{
                fontSize: layout.bodyFontSize,
                color: subtextColor,
              }}
            />
            <IconWidget
              font="open_mushaf_icons"
              size={layout.bodyFontSize}
              icon={''}
              style={{ marginHorizontal: 6, color: subtextColor }}
            />
          </FlexWidget>

          <FlexWidget
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'flex-end',
              width: 'match_parent',
            }}
          >
            <TextWidget
              text={`الورد: ${compactWird}`}
              style={{
                fontSize: layout.bodyFontSize,
                color: subtextColor,
              }}
            />
            <IconWidget
              font="open_mushaf_icons"
              size={layout.bodyFontSize}
              icon={''}
              style={{ marginHorizontal: 6, color: subtextColor }}
            />
          </FlexWidget>
        </FlexWidget>
      </FlexWidget>
    </FlexWidget>
  );
}
