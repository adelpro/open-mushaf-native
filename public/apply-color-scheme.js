/**
 * Applies the stored color scheme (dark/light) to <html> before first paint,
 * preventing a flash of the wrong theme. Served from <head> via <script src>
 * so it runs synchronously during HTML parsing.
 */
(function () {
  try {
    const raw = localStorage.getItem('AppColorScheme');
    if (!raw) return;
    const preference = JSON.parse(raw);
    if (preference === 'dark' || preference === 'light') {
      document.documentElement.classList.add(preference);
      document.documentElement.style.colorScheme = preference;
    }
  } catch {
    // Ignore storage read failures (e.g. blocked cookies/privacy mode).
  }
})();
