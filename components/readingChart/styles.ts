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
  tooltipText: {
    color: '#fff',
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
  emptyText: {
    fontSize: 14,
    fontFamily: 'Tajawal_400Regular',
    marginTop: 8,
  },
});
