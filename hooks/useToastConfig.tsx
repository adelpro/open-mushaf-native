import { useColorScheme } from 'react-native'; // To detect the current theme

import {
  BaseToastProps,
  ErrorToast,
  SuccessToast,
  ToastConfig,
} from 'react-native-toast-message';

export default function useToastConfig() {
  const isDarkMode = useColorScheme() === 'dark';
  const toastConfig: ToastConfig = {
    success: (props: BaseToastProps) => {
      return (
        <SuccessToast
          {...props}
          style={{
            borderLeftColor: isDarkMode ? '#34d399' : '#28a745', // Green for success
            borderLeftWidth: 6,
            backgroundColor: isDarkMode ? '#1f2937' : '#f0fdf4', // Dark: Slate, Light: Light Green
            borderRadius: 8,
            margin: 10,
            height: '100%',
          }}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingVertical: 10,
            margin: 5,
            display: 'flex',
            justifyContent: 'flex-start',
            alignItems: 'center',
          }}
          text1Style={{
            fontSize: 17,
            color: isDarkMode ? '#d1fae5' : '#155724', // Text color adjusts to theme
          }}
        />
      );
    },
    error: (props: BaseToastProps) => {
      return (
        <ErrorToast
          {...props}
          style={{
            borderLeftColor: isDarkMode ? '#f87171' : '#dc3545', // Red for error
            borderLeftWidth: 6,
            backgroundColor: isDarkMode ? '#1f2937' : '#f8d7da', // Dark: Slate, Light: Light Red
            borderRadius: 8,
            margin: 10,
            height: '100%',
          }}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingVertical: 10,
            margin: 5,
            display: 'flex',
            justifyContent: 'flex-start',
            alignItems: 'center',
          }}
          text1Style={{
            fontSize: 17,
            color: isDarkMode ? '#fee2e2' : '#721c24', // Text color adjusts to theme
          }}
          text2Style={{
            fontSize: 15,
            color: isDarkMode ? '#fecaca' : '#721c24',
          }}
        />
      );
    },
  };
  return { toastConfig };
}
