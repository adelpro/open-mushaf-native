/**
 * Flag indicating if the application is currently running in debug mode.
 * Evaluates the EXPO_PUBLIC_DEBUG environment variable.
 */
export const debug = process.env.EXPO_PUBLIC_DEBUG === 'true' ? true : false;
