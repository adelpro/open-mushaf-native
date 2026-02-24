import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text } from 'react-native';

import { FontAwesome } from '@expo/vector-icons';

import { CONTACT_FORM_RATE_LIMIT_CONFIG } from '@/constants/ratelimitConfig';
import {
  ERROR_EMAIL_VALIDATION,
  ERROR_FORM_SUBMIT,
  ERROR_MESSAGE_VALIDATION,
  ERROR_NAME_VALIDATION,
} from '@/constants/errorMessages';
import { SUCCESS_FORM_SUBMIT } from '@/constants/uiMessages';
import { useColors } from '@/hooks';
import { checkRateLimit, RateLimitError } from '@/utils/rateLimiter';

import { ThemedButton } from './ThemedButton';
import { ThemedText } from './ThemedText';
import { ThemedTextInput } from './ThemedTextInput';
import { ThemedView } from './ThemedView';
import { useNotification } from '../Context/NotificationProvider';

export function ContactForm() {
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

    if (!isValidEmail(email)) {
      notify(ERROR_EMAIL_VALIDATION, 'email_validation', 'error');
      isValid = false;
    }

    if (message.trim().length < 10 || message.trim().length > 500) {
      notify(ERROR_MESSAGE_VALIDATION, 'message_validation', 'error');
      isValid = false;
    }

    return isValid;
  };

  /**
   * Enforce client-side rate limiting before sending to Telegram.
   * Throws RateLimitError if the limit is exceeded, which is caught
   * in handleSubmit and surfaced to the user via notify().
   */
  const enforceRateLimit = () => {
    const result = checkRateLimit(CONTACT_FORM_RATE_LIMIT_CONFIG.key, {
      maxRequests: CONTACT_FORM_RATE_LIMIT_CONFIG.maxRequests,
      windowMs: CONTACT_FORM_RATE_LIMIT_CONFIG.windowMs,
    });

    if (!result.allowed) {
      throw new RateLimitError(result.retryAfterMs);
    }
  };

  const sendToTelegram = async (text: string) => {
    const url = `https://api.telegram.org/bot${process.env.EXPO_PUBLIC_BOT_TOKEN}/sendMessage`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: process.env.EXPO_PUBLIC_CHAT_ID,
        text,
      }),
    });

    // Telegram itself is rate-limiting us — surface a friendly error
    if (response.status === 429) {
      const data = await response.json().catch(() => ({}));
      const retryAfterMs = (data?.parameters?.retry_after ?? 60) * 1000;
      throw new RateLimitError(retryAfterMs);
    }

    if (!response.ok) {
      throw new Error(`Telegram API error: ${response.status}`);
    }

    return response.json();
  };

  const handleSubmit = async () => {
    if (isLoading) return;
    if (!isFormValid()) return;

    try {
      enforceRateLimit();
    } catch (error) {
      if (error instanceof RateLimitError) {
        notify(
          `لقد تجاوزت الحد المسموح به. يرجى المحاولة بعد ${error.retryAfterSeconds} ثانية.`,
          'rate_limit_error',
          'error',
        );
        return;
      }
      throw error;
    }

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
    } catch (error) {
      if (error instanceof RateLimitError) {
        notify(
          `لقد تجاوزت الحد المسموح به. يرجى المحاولة بعد ${error.retryAfterSeconds} ثانية.`,
          'rate_limit_error',
          'error',
        );
      } else {
        notify(ERROR_FORM_SUBMIT, 'form_error', 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText id="name" style={styles.label}>
        الإسم
      </ThemedText>
      <ThemedTextInput
        style={[styles.input]}
        value={formData.name}
        onChangeText={(text) => handleChange('name', text)}
        placeholder="الإسم"
        aria-labelledby="name"
        accessibilityLabel="اسم المستخدم - يرجى إدخال اسمك"
      />

      <ThemedText id="email" style={styles.label}>
        البريد الالكتروني
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
