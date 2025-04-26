export default function useNotificationStyles() {
  return {
    neutral: { borderColor: '#CCC', backgroundColor: '#333', color: '#FFF' },
    success: {
      borderColor: '#34d399',
      backgroundColor: '#e6f9f0',
      color: '#155724',
    },
    error: {
      borderColor: '#dc3545',
      backgroundColor: '#f8d7da',
      color: '#721c24',
    },
    info: {
      borderColor: '#007bff',
      backgroundColor: '#e7f3fe',
      color: '#084298',
    },
  };
}
