/**
 * Android home-screen widget UI (react-native-android-widget).
 * Renders mushaf progress: title, progress ring, surah glyph, page/hizb/wird.
 * Used by widgets/widget-task-handler.tsx and hooks/useUpdateAndroidWidget.tsx.
 * Layout should stay in sync with app/widget-preview.tsx.
 */
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

const RING_SIZE = 72;
const RING_RADIUS = 28;
const RING_STROKE = 5;

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
  size: number;
  radius: number;
  strokeWidth: number;
  progress: number;
  trackColor: string;
  progressColor: string;
  label: string;
}): string {
  const {
    size,
    radius,
    strokeWidth,
    progress,
    trackColor,
    progressColor,
    label,
  } = params;

  const center = size / 2;
  // Android SVG text uses the baseline at y; offset slightly for visual centering.
  const labelY = center + 5;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
      <circle
        cx="${center}"
        cy="${center}"
        r="${radius}"
        stroke="${trackColor}"
        stroke-width="${strokeWidth}"
        fill="none"
      />
      <circle
        cx="${center}"
        cy="${center}"
        r="${radius}"
        stroke="${progressColor}"
        stroke-width="${strokeWidth}"
        stroke-dasharray="${circumference}"
        stroke-dashoffset="${strokeDashoffset}"
        stroke-linecap="round"
        fill="none"
      />
      <text
        x="${center}"
        y="${labelY}"
        text-anchor="middle"
        fill="${progressColor}"
        font-size="16"
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
  // Dark green primary has poor contrast on dark ivory; use primaryLight in dark mode.
  const primaryColor = (
    colorScheme === 'dark' ? theme.primaryLight : theme.primary
  ) as HexColor;
  const secondaryColor = theme.secondary as HexColor;
  const bgColor = theme.ivory as HexColor;

  const trackColor = withHexAlpha(
    secondaryColor,
    colorScheme === 'dark' ? '55' : '66',
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

  // TODO: currentSurahNumber can arrive unvalidated from widget task data;
  // clamp to integer in 1..114 before feeding surahToIconChar.
  const safeSurah = Math.floor(
    clamp(Number.isFinite(currentSurahNumber) ? currentSurahNumber : 1, 1, 114),
  );

  const compactWird = `${safeCompleted}/${safeGoal}`;

  const svgString = buildRingSvg({
    size: RING_SIZE,
    radius: RING_RADIUS,
    strokeWidth: RING_STROKE,
    progress,
    trackColor,
    progressColor: primaryColor,
    label: `${Math.round(progress)}٪`,
  });

  return (
    <FlexWidget
      style={{
        height: 'match_parent',
        width: 'match_parent',
        flexDirection: 'column',
        backgroundColor: bgColor,
        borderRadius: 32,
        borderWidth: 2,
        borderColor: secondaryColor,
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        justifyContent: 'center',
        overflow: 'hidden',
      }}
      clickAction="OPEN_APP"
    >
      {/* Header */}
      <FlexWidget
        style={{
          flexDirection: 'row',
          marginBottom: 2,
          justifyContent: 'center',
          alignItems: 'center',
          width: 'match_parent',
        }}
      >
        <TextWidget
          text="المصحف المفتوح"
          style={{
            fontSize: 16,
            fontWeight: '700',
            color: primaryColor,
          }}
        />
        <IconWidget
          font="open_mushaf_icons"
          size={16}
          icon={'\uF000'}
          style={{ marginHorizontal: 4, color: secondaryColor }}
        />
      </FlexWidget>

      {/* Main row */}
      <FlexWidget
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: 'match_parent',
          flex: 1,
        }}
      >
        {/* Progress ring */}
        <FlexWidget
          style={{
            width: RING_SIZE,
            height: RING_SIZE,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <SvgWidget
            style={{ height: RING_SIZE, width: RING_SIZE }}
            svg={svgString}
          />
        </FlexWidget>

        {/* Surah glyph */}
        <IconWidget
          font="open_mushaf_icons"
          size={48}
          icon={surahToIconChar(safeSurah)}
          style={{ marginHorizontal: 4, color: primaryColor }}
        />

        {/* Page / hizb / wird */}
        <FlexWidget
          style={{
            flex: 1,
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'flex-end',
          }}
        >
          <FlexWidget
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'flex-end',
            }}
          >
            <TextWidget
              text={`الصفحة: ${safePage}`}
              style={{
                fontSize: 13,
                color: primaryColor,
              }}
            />
            <IconWidget
              font="open_mushaf_icons"
              size={14}
              icon={'\uF002'}
              style={{ marginHorizontal: 4, color: secondaryColor }}
            />
          </FlexWidget>

          <FlexWidget
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'flex-end',
            }}
          >
            <TextWidget
              text={`الحزب: ${safeHizb}`}
              style={{
                fontSize: 13,
                color: primaryColor,
              }}
            />
            <IconWidget
              font="open_mushaf_icons"
              size={14}
              icon={'\uF3A5'}
              style={{ marginHorizontal: 4, color: secondaryColor }}
            />
          </FlexWidget>

          <FlexWidget
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'flex-end',
            }}
          >
            <TextWidget
              text={`الورد: ${compactWird}`}
              style={{
                fontSize: 13,
                color: primaryColor,
              }}
            />
            <IconWidget
              font="open_mushaf_icons"
              size={14}
              icon={'\uF259'}
              style={{ marginHorizontal: 4, color: secondaryColor }}
            />
          </FlexWidget>
        </FlexWidget>
      </FlexWidget>
    </FlexWidget>
  );
}
