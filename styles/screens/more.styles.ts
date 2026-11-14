import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    paddingHorizontal: 16,
    maxWidth: 640,
    width: '100%',
    alignSelf: 'center',
  },
  header: {
    marginBottom: 20,
    gap: 4,
  },
  headerTitle: {
    textAlign: 'right',
    writingDirection: 'rtl',
    fontSize: 28,
    lineHeight: 36,
  },
  headerSubtitle: {
    textAlign: 'right',
    writingDirection: 'rtl',
    fontSize: 14,
    lineHeight: 22,
    fontFamily: 'Tajawal_400Regular',
  },
  sections: {
    gap: 20,
  },
  sectionBlock: {
    gap: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontFamily: 'Tajawal_700Bold',
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  card: {
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 72,
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  rowPressed: {
    opacity: 0.72,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textColumn: {
    flex: 1,
    gap: 2,
  },
  itemTitle: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'right',
    writingDirection: 'rtl',
    fontFamily: 'Tajawal_700Bold',
  },
  itemSubtitle: {
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'right',
    writingDirection: 'rtl',
    fontFamily: 'Tajawal_400Regular',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 5,
    paddingVertical: 20,
  },
  modalContent: {
    width: '90%',
    maxWidth: 400,
    borderRadius: 12,
    padding: 16,
    elevation: 5,
    alignSelf: 'center',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    minHeight: 40,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'Tajawal_700Bold',
    textAlignVertical: 'center',
  },
  closeButton: {
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalMessage: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
    fontFamily: 'Tajawal_400Regular',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    width: '100%',
  },
  modalButton: {
    width: '40%',
    maxWidth: 120,
  },
});
