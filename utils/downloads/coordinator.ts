// A synchronous lease shared by all hook instances and resource kinds.
let active: AbortController | null = null;
export function acquireDownload(): AbortController {
  if (active) throw new Error('تنزيل آخر قيد التقدم بالفعل.');
  active = new AbortController();
  return active;
}
export function releaseDownload(controller: AbortController): void {
  if (active === controller) active = null;
}
export function cancelDownload(): void {
  active?.abort();
}
export function throwIfAborted(signal?: AbortSignal): void {
  if (signal?.aborted) {
    const error = new Error('Download cancelled');
    error.name = 'AbortError';
    throw error;
  }
}

/** Read cancellation afresh after an await; other consumers can abort the lease. */
export function isDownloadCancelled(signal: AbortSignal): boolean {
  return signal.aborted;
}
export function abortableDelay(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    throwIfAborted(signal);
    const abort = () => {
      clearTimeout(timer);
      signal.removeEventListener('abort', abort);
      const error = new Error('Download cancelled');
      error.name = 'AbortError';
      reject(error);
    };
    const timer = setTimeout(() => {
      signal.removeEventListener('abort', abort);
      resolve();
    }, ms);
    signal.addEventListener('abort', abort, { once: true });
  });
}

export function isDownloadActive(): boolean {
  return active !== null;
}
