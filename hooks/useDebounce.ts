import { useCallback, useEffect, useRef } from 'react';

/**
 * Hook to debounce a function call, ensuring it only executes after a specified delay
 * has passed since its last invocation.
 *
 * @param fun - The function to debounce.
 * @param delay - The delay in milliseconds.
 * @returns A debounced version of the provided function.
 */
export function useDebounce<T extends (...args: any[]) => void>(
  fun: T,
  delay: number,
) {
  const timeoutRef = useRef<number | null>(null);

  const debouncedFunction = useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = window.setTimeout(() => {
        fun(...args);
      }, delay);
    },
    [fun, delay],
  );

  useEffect(() => {
    return () => {
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return debouncedFunction;
}
