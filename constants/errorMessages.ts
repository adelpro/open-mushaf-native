/**
 * Centralized Arabic error messages for consistent user-facing errors.
 * All user-visible error strings should be defined here.
 */

/** Generic unexpected error message. */
export const ERROR_GENERIC = 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.';

/** Error shown when the app fails to load. */
export const ERROR_LOADING_APP = 'حدث خطأ أثناء تحميل التطبيق.';

/** Error shown when Quran metadata fails to load. */
export const ERROR_LOADING_METADATA = 'فشل في تحميل بيانات القرآن الكريم.';

/** Returns an error message for a missing mushaf page. */
export const ERROR_PAGE_NOT_FOUND = (page: number) =>
  `الصفحة ${page} غير موجودة.`;

/** Returns a formatted error message with additional details. */
export const ERROR_WITH_DETAILS = (details: string) =>
  `حدث خطأ: ${details}`;

/** Validation error for the name field (3–50 characters). */
export const ERROR_NAME_VALIDATION = 'الاسم يجب أن يكون بين 3 و 50 حرفًا.';

/** Validation error for an invalid email address. */
export const ERROR_EMAIL_VALIDATION = 'البريد الإلكتروني غير صحيح.';

/** Validation error for the message field (10–500 characters). */
export const ERROR_MESSAGE_VALIDATION = 'الرسالة يجب أن تكون بين 10 و 500 حرفًا.';

/** Error shown when the contact form submission fails. */
export const ERROR_FORM_SUBMIT = 'فشل في إرسال الرسالة. يرجى المحاولة مرة أخرى لاحقًا.';

/** Error shown when sharing the app fails. */
export const ERROR_SHARE = 'فشل في مشاركة التطبيق. يرجى المحاولة مرة أخرى.';

/** Success message shown after a form is submitted successfully. */
export const SUCCESS_FORM_SUBMIT = 'تم الإرسال بنجاح!';
