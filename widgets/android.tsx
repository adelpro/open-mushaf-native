'use no memo';
import React from 'react';

import { FlexWidget, TextWidget } from 'react-native-android-widget';

import { Colors } from '../constants/Colors';

export interface WidgetProps {
  dailyGoal?: number;
  dailyCompleted?: number;
  currentPage?: number;
  currentSurahName?: string;
  currentHizbNumber?: number;
}

const theme = Colors.dark;
const PRIMARY_COLOR = theme.primary;
const BG_COLOR = theme.card;
const TRACK_COLOR = theme.ivory + '20';
const TEXT_COLOR = theme.text;
const SUBTEXT_COLOR = theme.icon;

export default function AndroidWidget({
  dailyGoal = 1,
  dailyCompleted = 0,
  currentPage = 1,
  currentSurahName = 'الفاتحة',
  currentHizbNumber = 1,
}: WidgetProps) {
  const progress =
    dailyGoal > 0 ? Math.min(100, (dailyCompleted / dailyGoal) * 100) : 0;

  let message = 'ابدأ وردك اليومي';
  if (progress > 0 && progress < 50) {
    message = 'بداية موفقة، استمر!';
  } else if (progress >= 50 && progress < 100) {
    message = 'أحسنت، اقتربت من الهدف!';
  } else if (progress >= 100) {
    message = 'ما شاء الله، أتممت الورد!';
  }

  return (
    <FlexWidget
      style={{
        height: 'match_parent',
        width: 'match_parent',
        flexDirection: 'row',
        backgroundColor: BG_COLOR,
        borderRadius: 16,
        padding: 12,
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
      clickAction="OPEN_APP"
    >
      <FlexWidget
        style={{
          width: 64,
          height: 64,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: TRACK_COLOR,
          borderRadius: 32,
        }}
      >
        <TextWidget
          text={`${Math.round(progress)}%`}
          style={{
            fontSize: 14,
            fontWeight: 'bold',
            color: PRIMARY_COLOR,
          }}
        />
      </FlexWidget>

      <FlexWidget
        style={{
          flex: 1,
          marginLeft: 12,
          justifyContent: 'center',
          alignItems: 'flex-end',
        }}
      >
        <TextWidget
          text={currentSurahName}
          style={{
            fontSize: 16,
            color: TEXT_COLOR,
            marginBottom: 2,
          }}
        />
        <TextWidget
          text={`صفحة ${currentPage} • الحزب ${currentHizbNumber}`}
          style={{
            fontSize: 12,
            color: SUBTEXT_COLOR,
            marginBottom: 4,
          }}
        />
        <TextWidget
          text={message}
          style={{
            fontSize: 11,
            color: PRIMARY_COLOR,
          }}
        />
      </FlexWidget>
    </FlexWidget>
  );
}
