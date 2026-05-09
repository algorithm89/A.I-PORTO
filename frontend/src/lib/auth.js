// Check if user is logged in. If not, trigger login modal.
// Returns true if logged in, false if login modal was opened.
export function requireAuth() {
  const token = localStorage.getItem('token')
  if (!token) {
    window.dispatchEvent(new Event('open-login'))
    return false
  }
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    if (payload.exp * 1000 < Date.now()) {
      localStorage.removeItem('token')
      localStorage.removeItem('username')
      window.dispatchEvent(new Event('open-login'))
      return false
    }
  } catch {
    window.dispatchEvent(new Event('open-login'))
    return false
  }
  return true
}
