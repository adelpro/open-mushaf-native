import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text } from 'react-native';

import { FontAwesome } from '@expo/vector-icons';

import {
  ERROR_EMAIL_VALIDATION,
  ERROR_FORM_SUBMIT,
  ERROR_MESSAGE_VALIDATION,
  ERROR_NAME_VALIDATION,
  SUCCESS_FORM_SUBMIT,
} from '@/constants';
import { useColors } from '@/hooks/useColors';

import { useNotification } from './NotificationProvider';
import { ThemedButton } from './ThemedButton';
import { ThemedTextInput } from './ThemedInput';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

export default function ContactForm() {
  const { textColor, secondaryColor } = useColors();
  const { notify } = useNotification();
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
    let isValid = true;

    // Check all fields and show notifications for each error
    if (name.trim().length < 3 || name.trim().length > 50) {
      notify(ERROR_NAME_VALIDATION, 'name_validation', 'error');
      isValid = false;
    }

    if (isValidEmail(email) === false) {
      notify(ERROR_EMAIL_VALIDATION, 'email_validation', 'error');
      isValid = false;
    }

    if (message.trim().length < 10 || message.trim().length > 500) {
      notify(ERROR_MESSAGE_VALIDATION, 'message_validation', 'error');
      isValid = false;
    }

    return isValid;
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

      notify(SUCCESS_FORM_SUBMIT, 'form_success', 'success');
    } catch {
      notify(ERROR_FORM_SUBMIT, 'form_error', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText id="name" style={styles.label}>
        الاسم
      </ThemedText>
      <ThemedTextInput
        style={[styles.input]}
        value={formData.name}
        onChangeText={(text) => handleChange('name', text)}
        placeholder="الاسم"
        aria-labelledby="name"
        accessibilityLabel="اسم المستخدم - يرجى إدخال اسمك"
      />

      <ThemedText id="email" style={styles.label}>
        البريد الإلكتروني
      </ThemedText>
      <ThemedTextInput
        style={[styles.input]}
        value={formData.email}
        onChangeText={(text) => handleChange('email', text)}
        placeholder="your.email@example.com"
        placeholderTextColor={secondaryColor}
        keyboardType="email-address"
        aria-labelledby="email"
        accessibilityLabel="البريد الإلكتروني - يرجى إدخال بريدك الإلكتروني"
      />

      <ThemedText id="message" style={styles.label}>
        الرسالة
      </ThemedText>
      <ThemedTextInput
        style={[styles.input, styles.messageInput, { color: textColor }]}
        value={formData.message}
        onChangeText={(text) => handleChange('message', text)}
        placeholder="أكتب الرسالة هنا..."
        placeholderTextColor={secondaryColor}
        multiline
        aria-labelledby="message"
        accessibilityLabel="الرسالة - يرجى إدخال رسالتك"
      />

      <ThemedButton
        style={[
          isLoading && styles.disabledButton,
          isLoading && { backgroundColor: secondaryColor },
        ]}
        variant="primary"
        onPress={handleSubmit}
        accessibilityLabel={isLoading ? 'Sending message' : 'Submit the form'}
        accessibilityRole="button"
        accessibilityState={{ disabled: isLoading }}
      >
        {isLoading ? (
          <Text>
            جاري الإرسال&nbsp;&nbsp;
            <ActivityIndicator size="small" color="#fff" />
          </Text>
        ) : (
          <Text>
            إرسال&nbsp;&nbsp;
            <FontAwesome name="send-o" size={24} />
          </Text>
        )}
      </ThemedButton>
      {/* Remove Toast component */}
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
    marginStart: 10,
    alignSelf: 'flex-start',
  },
  input: {
    padding: 10,
    marginBottom: 15,
    width: '100%',
    marginHorizontal: 10,
    textAlign: 'right',
  },
  messageInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  disabledButton: {
    backgroundColor: '#999',
  },
});
