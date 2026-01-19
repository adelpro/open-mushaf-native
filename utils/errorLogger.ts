import { ErrorInfo } from 'react';

export function logError(error: Error, info: ErrorInfo): void {
  if (__DEV__) {
    console.error('Uncaught error:', error);
    console.error('Component stack:', info.componentStack);
  }
}
