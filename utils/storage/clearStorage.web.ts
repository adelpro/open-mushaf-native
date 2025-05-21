export async function clearStorageAndReload() {
  try {
    localStorage.clear();
    console.log('LocalStorage cleared!');
    window.location.reload();
  } catch (error) {
    console.error('Failed to clear web storage', error);
  }
}
