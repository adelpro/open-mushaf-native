import { StyleSheet } from 'react-native';
export const styles = StyleSheet.create({
  scroll: {
    padding: 16,
    paddingBottom: 80,
  },
  summaryCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    alignItems: 'center',
  },
  summaryBytes: {
    fontSize: 28,
    marginTop: 8,
    fontFamily: 'Tajawal_700Bold',
    lineHeight: 32,
  },
  summaryMeta: {
    fontSize: 13,
    opacity: 0.6,
    marginTop: 4,
  },
  summaryBar: {
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(127,127,127,0.18)',
    marginTop: 6,
    width: '60%',
    overflow: 'hidden',
  },
  summaryBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  sectionTitle: {
    marginBottom: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 10,
    paddingVertical: 4,
  },
  sectionHeaderMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionCount: {
    fontSize: 13,
    opacity: 0.6,
    fontFamily: 'Tajawal_500Medium',
  },
  card: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  riwayaName: {
    fontSize: 18,
  },
  statusBadge: {
    fontSize: 12,
    fontFamily: 'Tajawal_700Bold',
  },
  cardMeta: {
    fontSize: 12,
    opacity: 0.6,
    marginTop: 4,
  },
  progressBarTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(127,127,127,0.18)',
    marginTop: 10,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(127,127,127,0.25)',
  },
  chipLabel: {
    fontSize: 14,
    fontFamily: 'Tajawal_500Medium',
  },
  footnote: {
    fontSize: 12,
    opacity: 0.5,
    marginTop: 16,
    textAlign: 'center',
  },
  backButton: {
    marginTop: 24,
    alignSelf: 'center',
    width: 200,
  },
});
