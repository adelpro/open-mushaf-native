import React, { memo, useCallback, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text } from 'react-native';

import { FontAwesome } from '@expo/vector-icons';

import { useColors } from '@/hooks/useColors';

import { useNotification } from './NotificationProvider';
import { ThemedButton } from './ThemedButton';
import { ThemedTextInput } from './ThemedInput';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

interface FormData {
  name: string;
  email: string;
  message: string;
}

interface FormState {
  data: FormData;
  success: boolean;
  errors: Record<string, string>;
}

const initialState: FormState = {
  data: { name: '', email: '', message: '' },
  success: false,
  errors: {},
};

/**
 * Enhanced ContactForm using React 19 Actions API
 * Features: useActionState, optimistic updates, declarative error handling
 */
const OptimizedContactForm = memo(function OptimizedContactForm() {
  'use memo';

  const { textColor, secondaryColor } = useColors();
  const { notify } = useNotification();

  // Validation helpers
  const isValidEmail = (email: string) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  const validateForm = (formData: FormData): Record<string, string> => {
    const errors: Record<string, string> = {};

    if (formData.name.trim().length < 3 || formData.name.trim().length > 50) {
      errors.name = 'الإسم يجب أن يكون بين 3 و 50 حرفًا.';
    }

    if (!isValidEmail(formData.email)) {
      errors.email = 'البريد الألكتروني غير صحيح.';
    }

    if (
      formData.message.trim().length < 10 ||
      formData.message.trim().length > 500
    ) {
      errors.message = 'الرسالة يجب أن تكون بين 10 و 500 حرفًا.';
    }

    return errors;
  };

  // Send to Telegram function
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

    if (!response.ok) {
      throw new Error('Failed to send message');
    }

    return response.json();
  };

  // Traditional React state for form management
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    message: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);

  // Handle form submission
  const handleSubmit = useCallback(async () => {
    const validationErrors = validateForm(formData);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      Object.values(validationErrors).forEach((error, index) => {
        notify(error, `validation_error_${index}`, 'error');
      });
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const messageText = `
        Mushaf - warsh - Form Submission:
        Name: ${formData.name}
        Email: ${formData.email}
        Message: ${formData.message}
      `;

      await sendToTelegram(messageText);

      setFormData({ name: '', email: '', message: '' });
      setSuccess(true);
      notify('تم الإرسال بنجاح!', 'form_success', 'success');
    } catch (error) {
      notify(
        'فشل في إرسال الرسالة! يرجى المحاولة مرة أخرى لاحقًا.',
        'form_error',
        'error',
      );
    } finally {
      setIsLoading(false);
    }
  }, [formData, notify]);

  // Input change handlers
  const handleNameChange = useCallback((value: string) => {
    setFormData((prev) => ({ ...prev, name: value }));
  }, []);

  const handleEmailChange = useCallback((value: string) => {
    setFormData((prev) => ({ ...prev, email: value }));
  }, []);

  const handleMessageChange = useCallback((value: string) => {
    setFormData((prev) => ({ ...prev, message: value }));
  }, []);

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.form}>
        <ThemedText style={styles.label}>الإسم</ThemedText>
        <ThemedTextInput
          style={[styles.input, errors.name && styles.errorInput]}
          value={success ? '' : formData.name}
          onChangeText={handleNameChange}
          placeholder="الإسم"
          accessibilityLabel="اسم المستخدم - يرجى إدخال اسمك"
          editable={!isLoading}
        />

        <ThemedText style={styles.label}>البريد الالكتروني</ThemedText>
        <ThemedTextInput
          style={[styles.input, errors.email && styles.errorInput]}
          value={success ? '' : formData.email}
          onChangeText={handleEmailChange}
          placeholder="your.email@example.com"
          placeholderTextColor={secondaryColor}
          keyboardType="email-address"
          accessibilityLabel="البريد الإلكتروني - يرجى إدخال بريدك الإلكتروني"
          editable={!isLoading}
        />

        <ThemedText style={styles.label}>الرسالة</ThemedText>
        <ThemedTextInput
          style={[
            styles.input,
            styles.messageInput,
            { color: textColor },
            errors.message && styles.errorInput,
          ]}
          value={success ? '' : formData.message}
          onChangeText={handleMessageChange}
          placeholder="أكتب الرسالة هنا..."
          placeholderTextColor={secondaryColor}
          multiline
          accessibilityLabel="الرسالة - يرجى إدخال رسالتك"
          editable={!isLoading}
        />

        <ThemedButton
          style={[
            isLoading && styles.disabledButton,
            isLoading && { backgroundColor: secondaryColor },
          ]}
          variant="primary"
          onPress={handleSubmit}
          accessibilityLabel={isLoading ? 'جاري الإرسال' : 'إرسال النموذج'}
          accessibilityRole="button"
          accessibilityState={{ disabled: isLoading }}
          disabled={isLoading}
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

      {/* Success message */}
      {success && (
        <ThemedView style={styles.successContainer}>
          <ThemedText style={styles.successText}>
            ✅ تم إرسال رسالتك بنجاح!
          </ThemedText>
        </ThemedView>
      )}
    </ThemedView>
  );
});

// Add display name for debugging
OptimizedContactForm.displayName = 'OptimizedContactForm';

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
  form: {
    width: '100%',
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
  errorInput: {
    borderColor: '#ff4444',
    borderWidth: 2,
  },
  messageInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  disabledButton: {
    backgroundColor: '#999',
    opacity: 0.7,
  },
  successContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#e8f5e8',
    borderRadius: 8,
    borderColor: '#4caf50',
    borderWidth: 1,
  },
  successText: {
    color: '#2e7d32',
    fontSize: 16,
    textAlign: 'center',
    fontWeight: 'bold',
  },
});

export default OptimizedContactForm;
