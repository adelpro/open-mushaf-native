export const ERROR_MESSAGES = {
  // Metadata
  METADATA_LOAD_FAILED:
    'لم نتمكن من تحميل بيانات القرآن، يرجى المحاولة مرة أخرى لاحقاً.',

  // Asset / Image
  IMAGE_NOT_FOUND: 'هذه الصفحة غير متاحة حالياً.',

  // Reminders
  REMINDER_TOGGLE_FAILED:
    'لم نتمكن من تفعيل التذكير، يرجى المحاولة مرة أخرى لاحقاً.',
  REMINDER_SAVE_FAILED:
    'لم نتمكن من حفظ وقت التذكير، يرجى المحاولة مرة أخرى لاحقاً.',
  REMINDER_CANCEL_FAILED:
    'لم نتمكن من إلغاء إشعار التذكير، يرجى المحاولة مرة أخرى لاحقاً.',
  PERMISSION_REQUIRED: 'يحتاج التطبيق إلى إذن الإشعارات لتفعيل التذكيرات.',

  // Contact Form
  MESSAGE_SEND_FAILED:
    'لم نتمكن من إرسال رسالتك، يرجى المحاولة مرة أخرى لاحقاً.',

  // App Loading (Web)
  APP_LOAD_FAILED: 'لم نتمكن من تحميل التطبيق، حاول تحديث الصفحة.',

  // Static UI
  PAGE_NOT_FOUND: 'هذه الصفحة غير متاحة حالياً.',

  // Fallback
  UNKNOWN_ERROR: 'حدث خطأ ما، يرجى المحاولة مرة أخرى لاحقاً.',
} as const;
