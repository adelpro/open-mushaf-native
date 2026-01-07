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
const PRIMARY_COLOR = theme.primary; // Or theme.tint if primary is too dark, but using primary as requested
const BG_COLOR = theme.card; // Using card color for widget background
const TRACK_COLOR = theme.ivory + '20'; // Adding transparency to ivory for track
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
      {/* Left Side: Reading Info (RTL but laid out visually on the left for now, logic is per item) 
          Wait, user wants Arabic. We should probably align right if we want true Arabic feel, 
          but usually widgets are LTR in strict layout unless we reverse children. 
          Let's put text on right and circle on left? Or standard "Start -> End".
          Let's stick to: Circle on Left (or Right) - Text on the other side.
          Let's put Circle on Left, Text on Right for English, but for Arabic?
          Usually Arabic reads Right to Left. 
          So: Text (Right) ... Circle (Left).
          FlexWidget default is 'column', we set 'row'.
          If we want Text on Right, we should put FlexWidget (Text) then SvgWidget? 
          No, in Row: [Child1 (Left)] [Child2 (Right)].
          So for Arabic RTL feel: [SvgWidget (Left)] [TextWidget (Right)].
          Let's try that.
      */}

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
          alignItems: 'flex-end', // Align text to the right for Arabic
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
