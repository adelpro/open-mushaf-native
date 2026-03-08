export const ERROR_MESSAGES = {
  GENERIC: 'حدث خطأ ما. يرجى المحاولة مرة أخرى.',
  SHARE_FAILED: 'تعذر مشاركة التطبيق.',
  APP_LOAD: 'حدث خطأ أثناء تحميل التطبيق.',
  METADATA_LOAD: 'تعذر تحميل بيانات القرآن.',
  ASSET_LOAD: 'تعذر تحميل الملفات.',
  OFFLINE: 'أنت غير متصل بالإنترنت.',
  SERVICE_WORKER: 'حدث خطأ في خدمة التطبيق.',
  CONTACT_FAILED: 'تعذر إرسال الرسالة. يرجى المحاولة مرة أخرى لاحقًا.',
  INVALID_NAME: 'الاسم يجب أن يكون بين 3 و50 حرفًا.',
  INVALID_EMAIL: 'البريد الإلكتروني غير صحيح.',
  INVALID_MESSAGE: 'الرسالة يجب أن تكون بين 10 و500 حرفًا.',
  PAGE_NOT_FOUND: (page: number) => `الصفحة ${page} غير موجودة.`,
} as const;
