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

  const formatNumber = (n: number) =>
    Number.isInteger(n) ? String(n) : n.toFixed(1);

  const compactWird = `${formatNumber(safeCompleted)} / ${safeGoal} حزب`;

  const radius = 28;
  const strokeWidth = 5;
  const svgString = buildRingSvg({
    radius,
    strokeWidth,
    progress,
    trackColor,
    progressColor: primaryColor,
    label: `٪${Math.round(progress)}`,
  });

  const detailsText = `صفحة ${safePage} • حزب ${safeHizb}`;

  return (
    <FlexWidget
      style={{
        height: 'match_parent',
        width: 'match_parent',
        flexDirection: 'column',
        backgroundColor: bgColor,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: outlineColor,
        paddingHorizontal: 20,
        paddingVertical: 18,
        justifyContent: 'center',
      }}
      clickAction="OPEN_APP"
    >
      {/* Top row: surah + details on the left, ring on the right */}
      <FlexWidget
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: 'match_parent',
        }}
      >
        <FlexWidget
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'flex-end',
            paddingLeft: 8,
          }}
        >
          <FlexWidget
            style={{
              flexDirection: 'column',
              alignItems: 'flex-end',
            }}
          >
            <TextWidget
              text={`📖 ${surahName}`}
              style={{
                fontSize: 22,
                fontWeight: '700',
                color: textColor,
                lineHeight: 26,
                textAlign: 'right',
                writingDirection: 'rtl',
              }}
            />
            <TextWidget
              text={detailsText}
              style={{
                fontSize: 15,
                fontWeight: '500',
                color: subtextColor,
                marginTop: 2,
                textAlign: 'right',
                writingDirection: 'rtl',
              }}
            />
          </FlexWidget>

          <TextWidget
            text={`الورد: ${compactWird}`}
            style={{
              fontSize: 16,
              color: subtextColor,
              fontWeight: '500',
              marginTop: 6,
              textAlign: 'right',
            }}
          />
        </FlexWidget>

        <FlexWidget
          style={{
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            marginLeft: 12,
          }}
        >
          <TextWidget
            text="الورد اليومي"
            style={{
              fontSize: 16,
              color: subtextColor,
              fontWeight: '500',
              marginBottom: 6,
              textAlign: 'center',
            }}
          />
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
      </FlexWidget>
    </FlexWidget>
  );
}
