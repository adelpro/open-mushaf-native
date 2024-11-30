import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { ActivityIndicator, TextInput } from 'react-native';

import Toast from 'react-native-toast-message';

import { useColors } from '@/hooks/useColors';
import useToastConfig from '@/hooks/useToastConfig';

import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

export default function ContactForm() {
  const { textColor, primaryColor, secondaryColor } = useColors();
  const { toastConfig } = useToastConfig();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });

  const handleChange = (name: string, value: string) => {
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const isValidEmail = (email: string) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  const isFormValid = () => {
    const { name, email, message } = formData;

    if (name.trim().length < 3 || name.trim().length > 50) {
      Toast.show({
        type: 'error',
        text1: 'خطأ في الإدخال',
        text2: 'الإسم يجب أن يكون بين 3 و 50 حرفًا.',
      });
      return false;
    }
    if (isValidEmail(email) === false) {
      Toast.show({
        type: 'error',
        text1: 'خطأ في الإدخال',
        text2: 'البريد الألكتروني غير صحيح.',
      });

      return false;
    }
    if (message.trim().length < 10 || message.trim().length > 500) {
      Toast.show({
        type: 'error',
        text1: 'خطأ في الإدخال',
        text2: 'الرسالة يجب أن تكون بين 10 و 500 حرفًا.',
      });
      return false;
    }
    return true;
  };

  const sendToTelegram = async (text: string) => {
    const url = `https://api.telegram.org/bot${process.env.EXPO_PUBLIC_BOT_TOKEN}/sendMessage`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: process.env.EXPO_PUBLIC_CHAT_ID,
        text: text,
      }),
    });
    return response.json();
  };

  const handleSubmit = async () => {
    if (!isFormValid()) return;

    setIsLoading(true);
    try {
      const messageText = `
        Mushaf - warsh - Form Submission:
        Name: ${formData.name}
        Email: ${formData.email}
        Message: ${formData.message}
      `;

      await sendToTelegram(messageText);
      setFormData({ name: '', email: '', message: '' });

      Toast.show({
        type: 'success',
        text1: 'تم إرسال الرسالة بنجاح!',
      });
    } catch {
      Toast.show({
        type: 'error',
        text1: 'فشل في إرسال الرسالة!',
        text2: 'يرجى المحاولة مرة أخرى لاحقًا.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.label}>الإسم</ThemedText>
      <TextInput
        style={[styles.input, { color: textColor }]}
        value={formData.name}
        onChangeText={(text) => handleChange('name', text)}
        placeholder="الإسم"
        placeholderTextColor="#999"
      />

      <ThemedText style={styles.label}>البريد الالكتروني</ThemedText>
      <TextInput
        style={[styles.input, { color: textColor }]}
        value={formData.email}
        onChangeText={(text) => handleChange('email', text)}
        placeholder="your.email@example.com"
        placeholderTextColor="#999"
        keyboardType="email-address"
      />

      <ThemedText style={styles.label}>الرسالة</ThemedText>
      <TextInput
        style={[styles.input, styles.messageInput, { color: textColor }]}
        value={formData.message}
        onChangeText={(text) => handleChange('message', text)}
        placeholder="أكتب الرسالة هنا..."
        placeholderTextColor="#999"
        multiline
      />

      <TouchableOpacity
        style={[
          styles.button,
          { backgroundColor: primaryColor },
          isLoading && styles.disabledButton,
          isLoading && { backgroundColor: secondaryColor },
        ]}
        onPress={handleSubmit}
        // disabled={!isFormValid() || isLoading}
      >
        {isLoading ? (
          <>
            <ActivityIndicator
              size="small"
              color="#fff"
              style={{ margin: 10 }}
            />
            <ThemedText style={styles.buttonText}>جاري الإرسال</ThemedText>
          </>
        ) : (
          <>
            <ThemedText style={styles.buttonText}>إرسال</ThemedText>
          </>
        )}
      </TouchableOpacity>
      <Toast config={toastConfig} />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    width: '100%',
    maxWidth: 640,
    alignSelf: 'center',
    margin: 5,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    marginLeft: 10,
    alignSelf: 'flex-start',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 10,
    marginBottom: 15,
    fontFamily: 'Amiri_400Regular',
    width: '100%',
    marginHorizontal: 10,
    textAlign: 'right',
  },
  messageInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 4,
    margin: 10,
    width: '100%',
    maxWidth: 640,
    fontFamily: 'Amiri_400Regular',
  },
  disabledButton: {
    backgroundColor: '#999',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
});
