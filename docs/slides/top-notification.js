// Example usage:
// showTopNotification('This is a top notification! (Works better on medium to large screens.)');

export function showTopNotification(message) {
  // Create notification element
  const notification = window.document.createElement('div');
  notification.textContent = message;
  notification.style.position = 'fixed';
  notification.style.top = '10px';
  notification.style.left = '50%';
  notification.style.transform = 'translateX(-50%)';
  notification.style.background = 'rgba(0,0,0,0.5)';
  notification.style.color = '#fff';
  notification.style.padding = '16px 32px';
  notification.style.fontSize = '0.8rem';
  notification.style.borderRadius = '5px';
  notification.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
  notification.style.zIndex = '9999';
  notification.style.transition = 'opacity 0.4s';
  notification.style.opacity = '1';
  notification.style.maxWidth = '200px';
  notification.style.width = '100%';
  notification.style.textAlign = 'center';

  // Note for screen size
  notification.title = 'Works better on medium to large screens.';

  window.document.body.appendChild(notification);

  // Hide after 5 seconds
  window.setTimeout(() => {
    notification.style.opacity = '0';
    window.setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 400);
  }, 5000);
}
