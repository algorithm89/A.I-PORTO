import { useState, useEffect, useCallback } from 'react'
import './BillingPage.css'

const API = `${import.meta.env.VITE_API_URL}/api/billing`

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

const NOW = new Date()
// Year dropdown: two years back through next year.
const YEARS = [NOW.getFullYear() - 2, NOW.getFullYear() - 1, NOW.getFullYear(), NOW.getFullYear() + 1]

const emptyForm = (email = '') => ({
  payerEmail: email,
  amount: '',
  month: NOW.getMonth() + 1, // 1-12
  year: NOW.getFullYear(),
  method: 'ETRANSFER',
  note: '',
  signature: '',
})

export default function BillingPage() {
  const token = localStorage.getItem('token')
  const authHeaders = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }

  const [access, setAccess]   = useState('checking') // 'checking' | 'ok' | 'denied'
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm]       = useState(emptyForm())
  const [saving, setSaving]   = useState(false)
  const [error, setError]     = useState(null)
  const [success, setSuccess] = useState(null)
  const [userEmail, setUserEmail] = useState('')

  // Pre-fill the associated email with the logged-in user's own email.
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) return
        const me = await res.json()
        if (cancelled || !me?.email) return
        setUserEmail(me.email)
        // Only fill if the user hasn't already typed something.
        setForm(f => (f.payerEmail ? f : { ...f, payerEmail: me.email }))
      } catch { /* leave the field empty on failure */ }
    })()
    return () => { cancelled = true }
  }, [token])

  const fetchRecords = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(API, { headers: { Authorization: `Bearer ${token}` } })
      if (res.status === 403) { setAccess('denied'); return }
      if (!res.ok) throw new Error(`Server returned ${res.status}`)
      setRecords(await res.json())
      setAccess('ok')
    } catch (e) {
      setError(e.message)
      setAccess('ok') // logged in but request failed for another reason
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => { fetchRecords() }, [fetchRecords])

  function update(field, value) {
    setForm(f => ({ ...f, [field]: value }))
  }

  async function deleteRecord(id) {
    if (!window.confirm('Delete this payment? This cannot be undone.')) return
    setError(null)
    try {
      const res = await fetch(`${API}/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.status === 403) { setAccess('denied'); return }
      if (!res.ok) throw new Error(`Server returned ${res.status}`)
      setRecords(r => r.filter(x => x.id !== id))
    } catch (e) {
      setError(e.message)
    }
  }

  async function submit(e) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(null)
    try {
      const res = await fetch(API, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          payerEmail: form.payerEmail.trim(),
          amount: Number(form.amount),
          // Store the selected month/year as the first of that month.
          paymentDate: `${form.year}-${String(form.month).padStart(2, '0')}-01`,
          method: form.method,
          note: form.note.trim() || null,
          signature: form.signature.trim(),
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (res.status === 403) { setAccess('denied'); return }
      if (!res.ok) throw new Error(data.message || `Server returned ${res.status}`)
      setRecords(r => [data, ...r])
      setForm(emptyForm(userEmail))
      setSuccess(`Payment recorded. A confirmation email was sent to the admin and ${data.payerEmail}.`)
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  const fmtMethod = (m) => (m === 'ETRANSFER' ? 'E-transfer' : 'Cash')
  const fmtAmount = (a) => `$${Number(a).toFixed(2)}`
  const fmtPeriod = (iso) => {
    if (!iso) return '—'
    const [y, m] = iso.split('-')
    return `${MONTHS[Number(m) - 1]} ${y}`
  }

  if (access === 'checking') {
    return <div className="billing-page"><p className="billing-status">Checking access…</p></div>
  }

  if (access === 'denied') {
    return (
      <div className="billing-page">
        <div className="billing-card billing-denied">
          <h1>🔒 Restricted</h1>
          <p>This billing page is private. Your account doesn’t have access.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="billing-page">
      <div className="billing-inner">
        <header className="billing-header">
          <h1>🧾 Billing</h1>
          <p>Record a payment. A confirmation email is sent to the admin and the associated email.</p>
        </header>

        <form className="billing-card billing-form" onSubmit={submit}>
          <h2>New payment</h2>

          <label>
            Associated email
            <input
              type="email"
              required
              placeholder="person@example.com"
              value={form.payerEmail}
              onChange={e => update('payerEmail', e.target.value)}
            />
          </label>

          <div className="billing-row">
            <label>
              Amount ($)
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                placeholder="0.00"
                value={form.amount}
                onChange={e => update('amount', e.target.value)}
              />
            </label>

            <label>
              Month
              <select value={form.month} onChange={e => update('month', Number(e.target.value))}>
                {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
              </select>
            </label>

            <label>
              Year
              <select value={form.year} onChange={e => update('year', Number(e.target.value))}>
                {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </label>
          </div>

          <label>
            Method
            <div className="billing-methods">
              <button
                type="button"
                className={form.method === 'ETRANSFER' ? 'active' : ''}
                onClick={() => update('method', 'ETRANSFER')}
              >💳 E-transfer</button>
              <button
                type="button"
                className={form.method === 'CASH' ? 'active' : ''}
                onClick={() => update('method', 'CASH')}
              >💵 Cash</button>
            </div>
          </label>

          <label>
            Note (optional)
            <textarea
              rows="2"
              placeholder="e.g. June rent"
              value={form.note}
              onChange={e => update('note', e.target.value)}
            />
          </label>

          <label className="billing-sign-label">
            Type your name to sign
            <input
              type="text"
              required
              maxLength={120}
              placeholder="Your full name"
              className="billing-sign-input"
              value={form.signature}
              onChange={e => update('signature', e.target.value)}
            />
            <span className="billing-sign-hint">
              By typing your name you confirm this payment is accurate.
            </span>
          </label>

          {error   && <p className="billing-error">{error}</p>}
          {success && <p className="billing-success">{success}</p>}

          <button type="submit" className="billing-submit" disabled={saving}>
            {saving ? 'Saving…' : 'Record payment'}
          </button>
        </form>

        <section className="billing-card">
          <h2>Payment history</h2>
          {loading ? (
            <p className="billing-status">Loading…</p>
          ) : records.length === 0 ? (
            <p className="billing-status">No payments recorded yet.</p>
          ) : (
            <div className="billing-table-wrap">
              <table className="billing-table">
                <thead>
                  <tr>
                    <th>Month</th>
                    <th>Email</th>
                    <th>Amount</th>
                    <th>Method</th>
                    <th>Note</th>
                    <th>Signed</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {records.map(r => (
                    <tr key={r.id}>
                      <td>{fmtPeriod(r.paymentDate)}</td>
                      <td>{r.payerEmail}</td>
                      <td className="billing-amount">{fmtAmount(r.amount)}</td>
                      <td>
                        <span className={`billing-pill ${r.method === 'CASH' ? 'cash' : 'etransfer'}`}>
                          {fmtMethod(r.method)}
                        </span>
                      </td>
                      <td>{r.note || '—'}</td>
                      <td className="billing-sig" title={r.createdBy ? `entered by ${r.createdBy}` : ''}>{r.signature || '—'}</td>
                      <td>
                        <button
                          type="button"
                          className="billing-delete"
                          onClick={() => deleteRecord(r.id)}
                          title="Delete payment"
                        >🗑</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
