import { ThemedText } from '../ThemedText';
import { ThemedView } from '../ThemedView';
import { styles } from './styles';
type Props = {
  bg: { backgroundColor: string };
  primaryColor: string;
  textColor: string;
  isPages: boolean;
  total: number;
  totalLabel: string;
  periodLabelSuffix: string;
  effectiveAvg: number;
  unitLabel: string;
  avgSuffix: string;
  isPartialWindow: boolean;
  recordsWithData: number;
  isDemoData: boolean;
};
export function ReadingChartStats(props: Props) {
  return (
    <ThemedView style={[styles.statsContainer, props.bg]}>
      <ThemedText style={[styles.bigNumber, { color: props.primaryColor }]}>
        {props.isPages ? props.total : props.total.toFixed(1)}
      </ThemedText>
      <ThemedText
        style={[styles.statsLabel, { color: props.textColor, opacity: 0.6 }]}
      >
        {props.totalLabel} {props.periodLabelSuffix}
      </ThemedText>
      {props.total > 0 && (
        <ThemedText
          style={[styles.avgLabel, { color: props.textColor, opacity: 0.4 }]}
        >
          المعدل:{' '}
          {props.isPages
            ? props.effectiveAvg.toFixed(0)
            : props.effectiveAvg.toFixed(1)}{' '}
          {props.unitLabel}
          {'/'}
          {props.avgSuffix}
        </ThemedText>
      )}
      {props.isPartialWindow && (
        <ThemedText
          style={[styles.avgLabel, { color: props.textColor, opacity: 0.4 }]}
        >
          بدأ التتبع قبل {props.recordsWithData} يوماً
        </ThemedText>
      )}
      {/* The chart falls back to generated history in Expo Go and in a dev
            build with no records yet. Label it so the figures above are never
            mistaken for a real reading history. */}
      {props.isDemoData && (
        <ThemedText
          style={[styles.avgLabel, { color: props.textColor, opacity: 0.4 }]}
        >
          بيانات تجريبية
        </ThemedText>
      )}
    </ThemedView>
  );
}
