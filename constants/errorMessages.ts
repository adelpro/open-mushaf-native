// Generic
export const ERROR_GENERIC = 'حدث خطأ غير متوقع، يرجى المحاولة مرة أخرى.';
export const ERROR_PREFIX = 'حدث خطأ';

// Data loading
export const ERROR_METADATA_LOAD = 'تعذّر تحميل بيانات المصحف.';
export const ERROR_PAGE_NOT_FOUND = (page: number) =>
  `الصفحة ${page} غير موجودة.`;

// Contact form validation
export const ERROR_NAME_VALIDATION = 'الاسم يجب أن يكون بين 3 و 50 حرفًا.';
export const ERROR_EMAIL_VALIDATION = 'البريد الإلكتروني غير صحيح.';
export const ERROR_MESSAGE_VALIDATION =
  'الرسالة يجب أن تكون بين 10 و 500 حرفًا.';
export const ERROR_FORM_SUBMIT =
  'فشل إرسال الرسالة، يرجى المحاولة مرة أخرى لاحقًا.';

// Success
export const SUCCESS_FORM_SUBMIT = 'تم الإرسال بنجاح.';

// Loading
export const LOADING_TEXT = 'جاري التحميل...';

// Modal
export const MODAL_TITLE_ERROR = 'خطأ';
