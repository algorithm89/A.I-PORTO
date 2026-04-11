import { useState, useEffect, useCallback } from 'react'
import TriangleGrid from './TriangleGrid'
import pic24 from '../assets/PIC24.png'
import './AdminPanel.css'

const API = `${import.meta.env.VITE_API_URL}/api/admin`

function AdminPanel({ onClose }) {
  const [users,   setUsers]   = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)
  const [deleting, setDeleting] = useState(null)  // id being deleted
  const [confirm,  setConfirm]  = useState(null)  // id waiting for confirm

  const token = localStorage.getItem('token')

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API}/users`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error(`Server returned ${res.status}`)
      setUsers(await res.json())
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => { fetchUsers() }, [fetchUsers])

  async function deleteUser(id) {
    setDeleting(id)
    try {
      const res = await fetch(`${API}/users/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error(`Delete failed: ${res.status}`)
      setUsers(prev => prev.filter(u => u.id !== id))
    } catch (e) {
      setError(e.message)
    } finally {
      setDeleting(null)
      setConfirm(null)
    }
  }

  async function toggleRole(user) {
    const newRole = user.role === 'ADMIN' ? 'USER' : 'ADMIN'
    try {
      const res = await fetch(`${API}/users/${user.id}/role?role=${newRole}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error('Role update failed')
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, role: newRole } : u))
    } catch (e) {
      setError(e.message)
    }
  }

  async function toggleEnabled(user) {
    try {
      const res = await fetch(`${API}/users/${user.id}/enabled?enabled=${!user.enabled}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error('Status update failed')
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, enabled: !u.enabled } : u))
    } catch (e) {
      setError(e.message)
    }
  }

  return (
    <div className="ap-backdrop" onClick={onClose}>
      <div className="ap-panel" onClick={e => e.stopPropagation()}>

        {/* Triangle grid covers the WHOLE panel — mouse tracked at panel level */}
        <TriangleGrid size={55} color="0,255,128" radius={3} />

        {/* ── Hero Banner ── */}
        <div className="ap-hero">

          {/* Close button */}
          <button className="ap-close" onClick={onClose} aria-label="Close">✕</button>

          {/* Centre: big PIC24 + title */}
          <div className="ap-hero-center">
            <img src={pic24} alt="Admin" className="ap-hero-logo" />
            <div className="ap-title">
              👑 Admin <span className="ap-title-accent">Panel</span>
            </div>
            <div className="ap-subtitle">BublikStudios — User Management</div>
          </div>
        </div>

        {/* Stats bar */}
        <div className="ap-stats">
          <div className="ap-stat">
            <span className="ap-stat-num">{users.length}</span>
            <span className="ap-stat-label">Total Users</span>
          </div>
          <div className="ap-stat">
            <span className="ap-stat-num ap-stat-green">{users.filter(u => u.enabled).length}</span>
            <span className="ap-stat-label">Verified</span>
          </div>
          <div className="ap-stat">
            <span className="ap-stat-num ap-stat-yellow">{users.filter(u => u.role === 'ADMIN').length}</span>
            <span className="ap-stat-label">Admins</span>
          </div>
          <div className="ap-stat">
            <span className="ap-stat-num ap-stat-red">{users.filter(u => !u.enabled).length}</span>
            <span className="ap-stat-label">Unverified</span>
          </div>
          <button className="ap-refresh" onClick={fetchUsers} title="Refresh">⟳ Refresh</button>
        </div>

        {/* Error */}
        {error && (
          <div className="ap-error">⚠️ {error} <button onClick={() => setError(null)}>✕</button></div>
        )}

        {/* Table */}
        <div className="ap-table-wrap">
          {loading ? (
            <div className="ap-loading">
              <div className="ap-spinner" />
              <span>Loading users…</span>
            </div>
          ) : users.length === 0 ? (
            <div className="ap-empty">No users found.</div>
          ) : (
            <table className="ap-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} className={`ap-row ${!u.enabled ? 'ap-row-disabled' : ''}`}>
                    <td className="ap-id">#{u.id}</td>
                    <td className="ap-username">
                      {u.role === 'ADMIN' && <span className="ap-crown">👑 </span>}
                      {u.username}
                    </td>
                    <td className="ap-email">{u.email}</td>
                    <td>
                      <button
                        className={`ap-badge ap-badge-role ${u.role === 'ADMIN' ? 'ap-badge-admin' : 'ap-badge-user'}`}
                        onClick={() => toggleRole(u)}
                        title="Click to toggle role"
                      >
                        {u.role}
                      </button>
                    </td>
                    <td>
                      <button
                        className={`ap-badge ${u.enabled ? 'ap-badge-active' : 'ap-badge-inactive'}`}
                        onClick={() => toggleEnabled(u)}
                        title="Click to toggle enabled"
                      >
                        {u.enabled ? '✅ Active' : '⏳ Pending'}
                      </button>
                    </td>
                    <td className="ap-date">
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                    </td>
                    <td className="ap-actions">
                      {confirm === u.id ? (
                        <div className="ap-confirm">
                          <span>Sure?</span>
                          <button
                            className="ap-btn-confirm"
                            onClick={() => deleteUser(u.id)}
                            disabled={deleting === u.id}
                          >
                            {deleting === u.id ? '…' : 'Yes'}
                          </button>
                          <button className="ap-btn-cancel" onClick={() => setConfirm(null)}>No</button>
                        </div>
                      ) : (
                        <button
                          className="ap-btn-delete"
                          onClick={() => setConfirm(u.id)}
                          disabled={deleting === u.id}
                        >
                          🗑 Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

      </div>
    </div>
  )
}

export default AdminPanel







