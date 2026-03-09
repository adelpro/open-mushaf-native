/**
 * Clears completely the web localStorage and reloads the web application.
 * Web platform implementation.
 *
 * @returns A promise resolving when the window reload is initiated.
 */
export async function clearStorageAndReload() {
  try {
    localStorage.clear();
    console.log('LocalStorage cleared!');
    window.location.reload();
  } catch (error) {
    console.error('Failed to clear web storage', error);
  }
}
