// Allow 3 submissions per 5 minutes per device session
export const CONTACT_FORM_RATE_LIMIT_CONFIG = {
  key: 'contact_form_submit',
  maxRequests: 3,
  windowMs: 5 * 60 * 1000,
} as const;
