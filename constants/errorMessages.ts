/**
 * Centralized Arabic error messages for consistent user-facing errors.
 * All user-visible error strings should be defined here.
 */

// Generic errors
export const ERROR_GENERIC = 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.';
export const ERROR_LOADING_APP = 'حدث خطأ أثناء تحميل التطبيق.';

// Data loading errors
export const ERROR_LOADING_METADATA = 'فشل في تحميل بيانات القرآن الكريم.';
export const ERROR_PAGE_NOT_FOUND = (page: number) =>
  `الصفحة ${page} غير موجودة.`;

// Display error with details
export const ERROR_WITH_DETAILS = (details: string) =>
  `حدث خطأ: ${details}`;

// Contact form validation
export const ERROR_NAME_VALIDATION = 'الاسم يجب أن يكون بين 3 و 50 حرفًا.';
export const ERROR_EMAIL_VALIDATION = 'البريد الإلكتروني غير صحيح.';
export const ERROR_MESSAGE_VALIDATION = 'الرسالة يجب أن تكون بين 10 و 500 حرفًا.';
export const ERROR_FORM_SUBMIT = 'فشل في إرسال الرسالة. يرجى المحاولة مرة أخرى لاحقًا.';

// Share errors
export const ERROR_SHARE = 'فشل في مشاركة التطبيق. يرجى المحاولة مرة أخرى.';

// Success messages
export const SUCCESS_FORM_SUBMIT = 'تم الإرسال بنجاح!';
