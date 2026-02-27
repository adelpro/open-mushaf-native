import { ErrorInfo } from 'react';

export function logError(error: Error, errorInfo: ErrorInfo): void {
  if (__DEV__) {
    console.error('[ErrorBoundary] Uncaught error:', error);
    console.error('[ErrorBoundary] Component stack:', errorInfo.componentStack);
  }
}
