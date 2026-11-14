import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    alignItems: 'center',
    alignSelf: 'center',
    width: '100%',
    maxWidth: 640,
  },
  addButton: {
    width: '100%',
    marginBottom: 16,
  },
  addButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    gap: 8,
  },
  addButtonText: {
    fontSize: 16,
    fontFamily: 'Tajawal_400Regular',
    color: 'white',
  },
  list: {
    width: '100%',
  },
  bookmarkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    elevation: 2,
  },
  bookmarkContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  bookmarkIcon: {
    marginEnd: 12,
  },
  bookmarkTextContainer: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  bookmarkLabel: {
    fontSize: 16,
    fontFamily: 'Tajawal_700Bold',
  },
  bookmarkPage: {
    fontSize: 13,
    fontFamily: 'Tajawal_400Regular',
    opacity: 0.7,
  },
  deleteButton: {
    padding: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontFamily: 'Tajawal_700Bold',
    marginTop: 16,
  },
  emptyHint: {
    fontSize: 14,
    fontFamily: 'Tajawal_400Regular',
    marginTop: 8,
    opacity: 0.6,
    textAlign: 'center',
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
    borderBottomColor: '#eee',
    minHeight: 40,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'Tajawal_700Bold',
  },
  closeButton: {
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalMessage: {
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
    fontFamily: 'Tajawal_400Regular',
  },
  labelInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    fontFamily: 'Tajawal_400Regular',
    marginBottom: 16,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'transparent',
    width: '100%',
  },
  modalButton: {
    width: '40%',
    maxWidth: 120,
  },
});
