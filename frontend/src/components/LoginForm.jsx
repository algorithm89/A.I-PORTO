import { useState } from 'react'
import './RegisterForm.css' // reuse same modal styles

function LoginForm({ onClose, onSwitchToRegister, onSuccess }) {
  const [form, setForm]       = useState({ username: '', password: '' })
  const [status, setStatus]   = useState(null)
  const [loading, setLoading] = useState(false)

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setStatus(null)
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(form),
      })
      const data = await res.json()
      if (res.ok) {
        localStorage.setItem('token', data.token)
        localStorage.setItem('username', form.username)
        setStatus({ type: 'success', msg: `Welcome back, ${form.username}! 🎉` })
        setTimeout(() => {
          if (onSuccess) onSuccess(data.token)
          else onClose()
        }, 1200)
      } else {
        const msg = data.message || 'Invalid username or password.'
        const isUnconfirmed = msg.toLowerCase().includes('confirm')
        setStatus({ type: isUnconfirmed ? 'warning' : 'error', msg })
      }
    } catch {
      setStatus({ type: 'error', msg: 'Could not reach the server. Is Spring Boot running?' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>

        <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>

        <div className="reg-header">
          <span className="sec-tag sec-tag-pink">🔐 Welcome Back</span>
          <h2 className="reg-title">Log <span className="gradient-text">in</span></h2>
          <p className="reg-sub">Good to see you again at BublikStudios.</p>
        </div>

        <form className="reg-form" onSubmit={handleSubmit} noValidate>
          <div className="reg-field">
            <label className="reg-label">Username</label>
            <input className="reg-input" type="text" name="username" value={form.username}
              onChange={handleChange} placeholder="your_username" required autoComplete="username" />
          </div>
          <div className="reg-field">
            <label className="reg-label">Password</label>
            <input className="reg-input" type="password" name="password" value={form.password}
              onChange={handleChange} placeholder="••••••••" required autoComplete="current-password" />
          </div>

          {status && (
            <div className={`reg-status reg-status-${status.type}`}>
              {status.type === 'success' ? '✅' : status.type === 'warning' ? '📧' : '❌'} {status.msg}
            </div>
          )}

          <button className="reg-btn login-btn" type="submit" disabled={loading}>
            {loading ? 'Logging in…' : 'Log in →'}
          </button>
        </form>

        <p className="reg-note">
          Don't have an account?{' '}
          <button className="switch-link" onClick={onSwitchToRegister}>Create one free →</button>
        </p>

      </div>
    </div>
  )
}

export default LoginForm


