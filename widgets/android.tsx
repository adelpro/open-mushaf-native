'use no memo';
import React from 'react';

import {
  FlexWidget,
  IconWidget,
  SvgWidget,
  TextWidget,
} from 'react-native-android-widget';
import type { HexColor } from 'react-native-android-widget';

import { Colors } from '../constants/Colors';

export type WidgetProps = {
  dailyGoal?: number;
  dailyCompleted?: number;
  currentPage?: number;
  currentSurahNumber?: number;
  currentHizbNumber?: number;
  colorScheme?: 'light' | 'dark';
};

function surahToIconChar(surahNumber: number): string {
  // 1. Convert surahNumber (e.g., 38) to a hex string ("38")
  // 2. Parse that string as a hex value (0x38)
  // 3. Add to base 0xe000
  const hexOffset = parseInt(surahNumber.toString(), 16);
  return String.fromCharCode(0xe000 + hexOffset);
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function withHexAlpha(hex: HexColor, alphaHex: string): HexColor {
  const normalized = hex.trim() as HexColor;
  const base =
    normalized.length === 9 ? (normalized.slice(0, 7) as HexColor) : normalized;
  return `${base}${alphaHex}` as HexColor;
}

function buildRingSvg(params: {
  radius: number;
  strokeWidth: number;
  progress: number;
  trackColor: string;
  progressColor: string;
  label: string;
}): string {
  const { radius, strokeWidth, progress, trackColor, progressColor, label } =
    params;

  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return `
    <svg width="72" height="72" viewBox="0 0 72 72">
      <circle
        cx="36"
        cy="36"
        r="${radius}"
        stroke="${trackColor}"
        stroke-width="${strokeWidth}"
        fill="none"
      />
      <circle
        cx="36"
        cy="36"
        r="${radius}"
        stroke="${progressColor}"
        stroke-width="${strokeWidth}"
        stroke-dasharray="${circumference}"
        stroke-dashoffset="${strokeDashoffset}"
        stroke-linecap="round"
        fill="none"
      />
      <text
        x="36"
        y="40"
        text-anchor="middle"
        dominant-baseline="middle"
        direction="rtl"
        fill="${progressColor}"
        font-size="18"
        font-weight="700"
        font-family="sans-serif"
      >${label}</text>
    </svg>
  `;
}

export default function AndroidWidget({
  dailyGoal = 1,
  dailyCompleted = 0,
  currentPage = 1,
  currentSurahNumber = 1,
  currentHizbNumber = 1,
  colorScheme = 'light',
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

  const svgString = buildRingSvg({
    radius: 28,
    strokeWidth: 5,
    progress,
    trackColor,
    progressColor: primaryColor,
    label: `٪${Math.round(progress)}`,
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
      {/* Header Row*/}
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
            fontSize: 22,
            fontWeight: '700',
            color: textColor,
            lineHeight: 26,
          }}
        />
        <IconWidget
          font="open_mushaf_icons"
          size={22}
          icon={'\uF000'}
          style={{ marginHorizontal: 6 }}
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
              width: 120,
              height: 120,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <SvgWidget style={{ height: 120, width: 120 }} svg={svgString} />
          </FlexWidget>
        </FlexWidget>

        {/* Surah Name */}
        <IconWidget
          font="open_mushaf_icons"
          size={60}
          icon={surahToIconChar(currentSurahNumber)}
          style={{ marginHorizontal: 6 }}
        />

        {/* Content */}
        <FlexWidget
          style={{
            flexDirection: 'column',
            columnGap: 20,
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
                fontSize: 18,
                color: subtextColor,
              }}
            />
            <IconWidget
              font="open_mushaf_icons"
              size={18}
              icon={'\uF002'}
              style={{ marginHorizontal: 6 }}
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
                fontSize: 18,
                color: subtextColor,
              }}
            />
            <IconWidget
              font="open_mushaf_icons"
              size={18}
              icon={'\uF3A5'}
              style={{ marginHorizontal: 6 }}
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
                fontSize: 18,
                color: subtextColor,
              }}
            />
            <IconWidget
              font="open_mushaf_icons"
              size={18}
              icon={'\uF259'}
              style={{ marginHorizontal: 6 }}
            />
          </FlexWidget>
        </FlexWidget>
      </FlexWidget>
    </FlexWidget>
  );
}
