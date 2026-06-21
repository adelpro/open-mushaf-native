import { StyleSheet } from 'react-native';

import { CHART_PADDING } from '@/constants/readingChart';

export const styles = StyleSheet.create({
  container: {
    width: '90%',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    alignItems: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 4,
  },
  title: {
    fontSize: 18,
    fontFamily: 'Tajawal_700Bold',
  },
  metricToggle: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  metricBtn: {
    width: 70,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  metricBtnText: {
    fontSize: 12,
    fontFamily: 'Tajawal_500Medium',
  },
  statsContainer: {
    alignItems: 'center',
    marginBottom: 12,
    paddingVertical: 8,
  },
  bigNumber: {
    fontSize: 42,
    fontFamily: 'Tajawal_700Bold',
    lineHeight: 48,
  },
  statsLabel: {
    fontSize: 14,
    fontFamily: 'Tajawal_400Regular',
    marginTop: 2,
  },
  avgLabel: {
    fontSize: 12,
    fontFamily: 'Tajawal_400Regular',
    marginTop: 2,
  },
  groupByContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
  },
  groupByToggle: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  groupByBtn: {
    width: 70,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  groupByBtnText: {
    fontSize: 12,
    fontFamily: 'Tajawal_500Medium',
  },
  segmentContainer: {
    width: '100%',
    marginBottom: 12,
  },
  chartWrapper: {
    width: '100%',
    flexDirection: 'row',
  },
  yAxis: {
    position: 'absolute',
    left: 0,
    zIndex: 1,
  },
  chartScroll: {
    marginLeft: CHART_PADDING.left,
    flex: 1,
  },
  xAxisRow: {
    flexDirection: 'row',
    position: 'relative',
    height: 20,
  },
  xLabel: {
    position: 'absolute',
    textAlign: 'center',
    opacity: 0.5,
    fontFamily: 'Tajawal_400Regular',
  },
  touchLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  tooltip: {
    position: 'absolute',
    alignSelf: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignItems: 'center',
    minWidth: 40,
    zIndex: 100,
  },
  // Tooltip text uses the same on-primary token as the metric toggle label
  // (white in dark themes, dark in light themes) so it never disappears
  // against `primaryColor` in any future theme variant. Applied inline.
  tooltipText: {
    fontSize: 12,
    fontFamily: 'Tajawal_700Bold',
  },
  tooltipArrow: {
    position: 'absolute',
    bottom: -5,
    alignSelf: 'center',
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  tooltipArrowUp: {
    position: 'absolute',
    top: -5,
    alignSelf: 'center',
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderBottomWidth: 6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  emptyText: {
    fontSize: 14,
    fontFamily: 'Tajawal_400Regular',
    marginTop: 8,
  },
});
