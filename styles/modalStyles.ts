import { StyleSheet, TextStyle, ViewStyle } from 'react-native';

interface ModalStyleColors {
  overlayColor: string;
  borderLightColor: string;
}

interface ModalStyles {
  modalOverlay: ViewStyle;
  modalContent: ViewStyle;
  modalHeader: ViewStyle;
  modalTitle: TextStyle;
  closeButton: ViewStyle;
  modalMessage: TextStyle;
  modalActions: ViewStyle;
  modalButton: ViewStyle;
}

export const createModalStyles = (colors: ModalStyleColors): ModalStyles =>
  StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: colors.overlayColor,
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
      borderBottomColor: colors.borderLightColor,
      minHeight: 40,
      backgroundColor: 'transparent',
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
      justifyContent: 'space-around',
      backgroundColor: 'transparent',
      width: '100%',
    },
    modalButton: {
      width: '40%',
      maxWidth: 120,
    },
  });
