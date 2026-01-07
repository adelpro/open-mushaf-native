'use no memo';
import React from 'react';

import { FlexWidget, SvgWidget, TextWidget } from 'react-native-android-widget';
import type { HexColor } from 'react-native-android-widget';

import { Colors } from '../constants/Colors';

export type WidgetProps = {
  dailyGoal?: number;
  dailyCompleted?: number;
  currentPage?: number;
  currentSurahName?: string;
  currentHizbNumber?: number;
  colorScheme?: 'light' | 'dark';
};

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
        transform="rotate(-90 36 36)"
        fill="none"
      />
      <text
        x="36"
        y="40"
        text-anchor="middle"
        dominant-baseline="middle"
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
  currentSurahName = 'الفاتحة',
  currentHizbNumber = 1,
  colorScheme = 'light',
}: WidgetProps) {
  const theme = colorScheme === 'dark' ? Colors.dark : Colors.light;
  const primaryColor = theme.primary as HexColor;
  const bgColor = theme.card as HexColor;
  const textColor = theme.text as HexColor;
  const subtextColor = theme.icon as HexColor;
  const outlineColor = withHexAlpha(
    theme.text as HexColor,
    colorScheme === 'dark' ? '24' : '14',
  );
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
  const surahName = (currentSurahName ?? '').trim() || 'الفاتحة';

  // Design Constants for "Minimalist Modern Ring"
  const radius = 28;
  const strokeWidth = 5;
  const svgString = buildRingSvg({
    radius,
    strokeWidth,
    progress,
    trackColor,
    progressColor: primaryColor,
    label: `${Math.round(progress)}%`,
  });
  const detailsText = `صفحة ${safePage} • حزب ${safeHizb}`;

  return (
    <FlexWidget
      style={{
        height: 'match_parent',
        width: 'match_parent',
        flexDirection: 'row',
        backgroundColor: bgColor,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: outlineColor,
        paddingHorizontal: 20,
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'flex-end', // Align all content to the right
      }}
      clickAction="OPEN_APP"
    >
      {/* Text Information (Left side, taking up space, aligned to right) */}
      <FlexWidget
        style={{
          flex: 1,
          marginRight: 24, // Space between text and ring
          justifyContent: 'center',
          alignItems: 'flex-end', // Right align the text itself
        }}
      >
        <TextWidget
          text={surahName}
          style={{
            fontSize: 22,
            fontWeight: 'bold',
            color: textColor,
            marginBottom: 4,
          }}
        />

        <TextWidget
          text={detailsText}
          style={{
            fontSize: 14,
            color: subtextColor,
            fontWeight: '500',
          }}
        />
      </FlexWidget>

      {/* Progress Ring Area (Right Side) */}
      <FlexWidget
        style={{
          width: 72,
          height: 72,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <SvgWidget style={{ height: 72, width: 72 }} svg={svgString} />
      </FlexWidget>
    </FlexWidget>
  );
}
