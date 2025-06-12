/* global document */
document.addEventListener('DOMContentLoaded', function () {
  const currentPath = window.location.pathname.split('/').pop();
  const langArButton = document.getElementById('lang-ar');
  const langEnButton = document.getElementById('lang-en');
  const switcher = document.getElementById('language-switcher');
  const globe = document.getElementById('globe-icon');
  let hideTimeout;

  function showSwitcher() {
    switcher.style.display = 'flex';
    globe.style.display = 'none';
    window.clearTimeout(hideTimeout);
    hideTimeout = window.setTimeout(hideSwitcher, 3000);
  }

  function hideSwitcher() {
    switcher.style.display = 'none';
    globe.style.display = 'flex';
  }

  // Initial show, then auto-hide
  showSwitcher();

  // Show on hover
  globe.addEventListener('mouseenter', showSwitcher);
  switcher.addEventListener('mouseenter', showSwitcher);

  // Reset timer on mouse move over switcher
  switcher.addEventListener('mousemove', showSwitcher);

  // Hide when mouse leaves switcher
  switcher.addEventListener('mouseleave', () => {
    window.clearTimeout(hideTimeout);
    hideTimeout = window.setTimeout(hideSwitcher, 1000);
  });

  // Accessibility: show on focus
  switcher.addEventListener('focusin', showSwitcher);
  globe.addEventListener('focus', showSwitcher);

  // Language selection logic
  if (currentPath === 'index-ar.html') {
    langArButton.classList.add('selected');
    langEnButton.classList.remove('selected');
    langArButton.setAttribute('aria-current', 'true');
    langEnButton.removeAttribute('aria-current');
  } else if (currentPath === 'index-en.html') {
    langEnButton.classList.add('selected');
    langArButton.classList.remove('selected');
    langEnButton.setAttribute('aria-current', 'true');
    langArButton.removeAttribute('aria-current');
  }
});
