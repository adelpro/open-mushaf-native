import { ErrorInfo } from 'react';

/**
 * Logs uncaught React component errors gracefully in development mode.
 *
 * @param error - The javascript Error object that was thrown.
 * @param errorInfo - React error info containing the component stack trace.
 * @returns void
 */
export function logError(error: Error, errorInfo: ErrorInfo): void {
  if (__DEV__) {
    console.error('[ErrorBoundary] Uncaught error:', error);
    console.error('[ErrorBoundary] Component stack:', errorInfo.componentStack);
  }
}
