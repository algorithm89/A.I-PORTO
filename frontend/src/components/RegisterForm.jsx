import { useState } from 'react'
import './RegisterForm.css'

function RegisterForm({ onClose, onSwitchToLogin }) {
  const [form, setForm]       = useState({ username: '', email: '', password: '' })
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
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/register`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(form),
      })
      const data = await res.json()
      if (res.ok) {
        setStatus({ type: 'success', msg: data.message })
        setForm({ username: '', email: '', password: '' })
        // Auto-switch to login after 2s so user can log in right away
        setTimeout(() => {
          if (onSwitchToLogin) onSwitchToLogin()
        }, 2000)
      } else {
        setStatus({ type: 'error', msg: data.message || 'Something went wrong.' })
      }
    } catch {
      setStatus({ type: 'error', msg: 'Could not reach the server. Is Spring Boot running?' })
    } finally {
      setLoading(false)
    }
  }

  return (
    /* Backdrop */
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>

        <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>

        <div className="reg-header">
          <span className="sec-tag sec-tag-cyan">✦ Join the Studio</span>
          <h2 className="reg-title">Create your <span className="gradient-text">account</span></h2>
          <p className="reg-sub">Get access to stories, AI tutorials and more. Free forever.</p>
        </div>

        <form className="reg-form" onSubmit={handleSubmit} noValidate>
          <div className="reg-field">
            <label className="reg-label">Username</label>
            <input className="reg-input" type="text" name="username" value={form.username}
              onChange={handleChange} placeholder="bublik_dev" required autoComplete="off" />
          </div>
          <div className="reg-field">
            <label className="reg-label">Email</label>
            <input className="reg-input" type="email" name="email" value={form.email}
              onChange={handleChange} placeholder="you@example.com" required />
          </div>
          <div className="reg-field">
            <label className="reg-label">Password</label>
            <input className="reg-input" type="password" name="password" value={form.password}
              onChange={handleChange} placeholder="At least 8 characters" required />
          </div>

          {status && (
            <div className={`reg-status reg-status-${status.type}`}>
              {status.type === 'success' ? '✅' : '❌'} {status.msg}
            </div>
          )}

          <button className="reg-btn" type="submit" disabled={loading}>
            {loading ? 'Creating account…' : 'Register →'}
          </button>
        </form>

        <p className="reg-note">
          A confirmation email will be sent to verify your address.<br />
          No spam. Secure link only 🔐
          {onSwitchToLogin && (
            <><br />Already have an account?{' '}
            <button className="switch-link" onClick={onSwitchToLogin}>Log in →</button></>
          )}
        </p>

      </div>
    </div>
  )
}

export default RegisterForm


