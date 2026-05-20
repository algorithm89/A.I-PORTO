import { useState, useEffect, useCallback } from 'react'
import TriangleGrid from './TriangleGrid'
import pic24 from '../assets/PIC24.webp'
import './AdminPanel.css'

const API = `${import.meta.env.VITE_API_URL}/api/admin`

function AdminPanel({ onClose }) {
  const [tab, setTab] = useState('users') // 'users' | 'episodes' | 'chapters'

  // ── Users state ──
  const [users,   setUsers]   = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [confirm,  setConfirm]  = useState(null)

  // ── Episodes state ──
  const [episodes, setEpisodes] = useState([])
  const [epLoading, setEpLoading] = useState(false)
  const [editing, setEditing] = useState(null) // episode being edited, or null for new
  const [epForm, setEpForm] = useState({ series: 'Neon Spirit', episodeNumber: '', title: '', subtitle: '', rawText: '', content: '' })
  const [formatting, setFormatting] = useState(false)
  const [saving, setSaving] = useState(false)
  const [preview, setPreview] = useState(false)

  // ── Chapters state ──
  const [chEpisodeId, setChEpisodeId] = useState('')
  const [chapters, setChapters] = useState([])
  const [chLoading, setChLoading] = useState(false)
  const [chEditing, setChEditing] = useState(null) // chapter being edited, 'new', or null
  const [chForm, setChForm] = useState({ chapterNumber: '', title: '', rawText: '', content: '' })
  const [chFormatting, setChFormatting] = useState(false)
  const [chSaving, setChSaving] = useState(false)
  const [chPreview, setChPreview] = useState(false)

  const token = localStorage.getItem('token')
  const authHeaders = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }

  // ═══════════════════════════════════════════
  //  USERS
  // ═══════════════════════════════════════════
  const fetchUsers = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API}/users`, { headers: { Authorization: `Bearer ${token}` } })
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
      const res = await fetch(`${API}/users/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
      if (!res.ok) throw new Error(`Delete failed: ${res.status}`)
      setUsers(prev => prev.filter(u => u.id !== id))
    } catch (e) { setError(e.message) }
    finally { setDeleting(null); setConfirm(null) }
  }

  async function toggleRole(user) {
    const newRole = user.role === 'ADMIN' ? 'USER' : 'ADMIN'
    try {
      const res = await fetch(`${API}/users/${user.id}/role?role=${newRole}`, { method: 'PATCH', headers: { Authorization: `Bearer ${token}` } })
      if (!res.ok) throw new Error('Role update failed')
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, role: newRole } : u))
    } catch (e) { setError(e.message) }
  }

  async function toggleEnabled(user) {
    try {
      const res = await fetch(`${API}/users/${user.id}/enabled?enabled=${!user.enabled}`, { method: 'PATCH', headers: { Authorization: `Bearer ${token}` } })
      if (!res.ok) throw new Error('Status update failed')
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, enabled: !u.enabled } : u))
    } catch (e) { setError(e.message) }
  }

  // ═══════════════════════════════════════════
  //  EPISODES
  // ═══════════════════════════════════════════
  const fetchEpisodes = useCallback(async () => {
    setEpLoading(true)
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/episodes`, { headers: { Authorization: `Bearer ${token}` } })
      if (!res.ok) throw new Error(`Server returned ${res.status}`)
      setEpisodes(await res.json())
    } catch (e) { setError(e.message) }
    finally { setEpLoading(false) }
  }, [token])

  useEffect(() => { if (tab === 'episodes' || tab === 'chapters') fetchEpisodes() }, [tab, fetchEpisodes])

  function startNewEpisode() {
    setEditing('new')
    setEpForm({ series: 'Neon Spirit', episodeNumber: episodes.length + 1, title: '', subtitle: '', rawText: '', content: '' })
    setPreview(false)
  }

  function startEditEpisode(ep) {
    setEditing(ep.id)
    setEpForm({ series: ep.series, episodeNumber: ep.episodeNumber, title: ep.title, subtitle: ep.subtitle || '', rawText: '', content: ep.content || '' })
    setPreview(false)
  }

  async function handleAIFormat() {
    if (!epForm.rawText.trim()) { setError('Please paste some story text first.'); return }
    setFormatting(true)
    setError(null)
    try {
      const res = await fetch(`${API}/episodes/format`, {
        method: 'POST', headers: authHeaders,
        body: JSON.stringify({ rawText: epForm.rawText }),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.message)
      setEpForm(prev => ({ ...prev, content: data.message }))
      setPreview(true)
    } catch (e) { setError(e.message) }
    finally { setFormatting(false) }
  }

  async function handleSaveEpisode() {
    if (!epForm.series || !epForm.episodeNumber || !epForm.title) {
      setError('Series, episode number, and title are required.'); return
    }
    setSaving(true)
    setError(null)
    try {
      const body = {
        series: epForm.series,
        episodeNumber: parseInt(epForm.episodeNumber, 10),
        title: epForm.title,
        subtitle: epForm.subtitle,
        coverImage: 'PIC10.png',
        content: epForm.content,
      }
      const url = editing === 'new'
        ? `${API}/episodes`
        : `${API}/episodes/${editing}`
      const method = editing === 'new' ? 'POST' : 'PUT'

      const res = await fetch(url, { method, headers: authHeaders, body: JSON.stringify(body) })
      if (!res.ok) throw new Error(`Save failed: ${res.status}`)
      setEditing(null)
      fetchEpisodes()
    } catch (e) { setError(e.message) }
    finally { setSaving(false) }
  }

  async function deleteEpisode(id) {
    try {
      const res = await fetch(`${API}/episodes/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
      if (!res.ok) throw new Error(`Delete failed: ${res.status}`)
      setEpisodes(prev => prev.filter(e => e.id !== id))
    } catch (e) { setError(e.message) }
  }

  // ═══════════════════════════════════════════
  //  CHAPTERS
  // ═══════════════════════════════════════════
  const fetchChapters = useCallback(async (episodeId) => {
    if (!episodeId) { setChapters([]); return }
    setChLoading(true)
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/episodes/${episodeId}/chapters`, { headers: { Authorization: `Bearer ${token}` } })
      if (!res.ok) throw new Error(`Server returned ${res.status}`)
      setChapters(await res.json())
    } catch (e) { setError(e.message) }
    finally { setChLoading(false) }
  }, [token])

  function selectChapterEpisode(id) {
    setChEpisodeId(id)
    setChEditing(null)
    fetchChapters(id)
  }

  function startNewChapter() {
    if (!chEpisodeId) { setError('Pick an episode first.'); return }
    setChEditing('new')
    setChForm({ chapterNumber: chapters.length + 1, title: '', rawText: '', content: '' })
    setChPreview(false)
  }

  function startEditChapter(ch) {
    setChEditing(ch.id)
    setChForm({ chapterNumber: ch.chapterNumber, title: ch.title || '', rawText: '', content: ch.content || '' })
    setChPreview(false)
  }

  async function handleChapterAIFormat() {
    if (!chForm.rawText.trim()) { setError('Please paste some story text first.'); return }
    setChFormatting(true)
    setError(null)
    try {
      const res = await fetch(`${API}/episodes/format`, {
        method: 'POST', headers: authHeaders,
        body: JSON.stringify({ rawText: chForm.rawText }),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.message)
      setChForm(prev => ({ ...prev, content: data.message }))
      setChPreview(true)
    } catch (e) { setError(e.message) }
    finally { setChFormatting(false) }
  }

  async function handleSaveChapter() {
    if (!chEpisodeId || !chForm.chapterNumber) {
      setError('Episode and chapter number are required.'); return
    }
    setChSaving(true)
    setError(null)
    try {
      const body = {
        chapterNumber: parseInt(chForm.chapterNumber, 10),
        title: chForm.title,
        content: chForm.content,
      }
      const url = chEditing === 'new'
        ? `${API}/chapters?episodeId=${chEpisodeId}`
        : `${API}/chapters/${chEditing}`
      const method = chEditing === 'new' ? 'POST' : 'PUT'
      const res = await fetch(url, { method, headers: authHeaders, body: JSON.stringify(body) })
      if (!res.ok) throw new Error(`Save failed: ${res.status}`)
      setChEditing(null)
      fetchChapters(chEpisodeId)
    } catch (e) { setError(e.message) }
    finally { setChSaving(false) }
  }

  async function deleteChapter(id) {
    try {
      const res = await fetch(`${API}/chapters/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
      if (!res.ok) throw new Error(`Delete failed: ${res.status}`)
      setChapters(prev => prev.filter(c => c.id !== id))
    } catch (e) { setError(e.message) }
  }

  // ═══════════════════════════════════════════
  //  RENDER
  // ═══════════════════════════════════════════
  return (
    <div className="ap-backdrop" onClick={onClose}>
      <div className="ap-panel" onClick={e => e.stopPropagation()}>

        <TriangleGrid size={55} color="0,255,128" radius={3} />

        {/* ── Hero Banner ── */}
        <div className="ap-hero">
          <button className="ap-close" onClick={onClose} aria-label="Close">✕</button>
          <div className="ap-hero-center">
            <img src={pic24} alt="Admin" className="ap-hero-logo" />
            <div className="ap-title">
              👑 Admin <span className="ap-title-accent">Panel</span>
            </div>
            <div className="ap-subtitle">BublikStudios — Management</div>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="ap-tabs">
          <button className={`ap-tab ${tab === 'users' ? 'ap-tab-active' : ''}`} onClick={() => { setTab('users'); setError(null) }}>👥 Users</button>
          <button className={`ap-tab ${tab === 'episodes' ? 'ap-tab-active' : ''}`} onClick={() => { setTab('episodes'); setError(null) }}>📖 Episodes</button>
          <button className={`ap-tab ${tab === 'chapters' ? 'ap-tab-active' : ''}`} onClick={() => { setTab('chapters'); setError(null) }}>📑 Chapters</button>
        </div>

        {/* Error */}
        {error && (
          <div className="ap-error">⚠️ {error} <button onClick={() => setError(null)}>✕</button></div>
        )}

        {/* ═══════════════════════════════════════════
            USERS TAB
            ═══════════════════════════════════════════ */}
        {tab === 'users' && (
          <>
            <div className="ap-stats">
              <div className="ap-stat"><span className="ap-stat-num">{users.length}</span><span className="ap-stat-label">Total</span></div>
              <div className="ap-stat"><span className="ap-stat-num ap-stat-green">{users.filter(u => u.enabled).length}</span><span className="ap-stat-label">Verified</span></div>
              <div className="ap-stat"><span className="ap-stat-num ap-stat-yellow">{users.filter(u => u.role === 'ADMIN').length}</span><span className="ap-stat-label">Admins</span></div>
              <div className="ap-stat"><span className="ap-stat-num ap-stat-red">{users.filter(u => !u.enabled).length}</span><span className="ap-stat-label">Unverified</span></div>
              <button className="ap-refresh" onClick={fetchUsers}>⟳ Refresh</button>
            </div>
            <div className="ap-table-wrap">
              {loading ? (
                <div className="ap-loading"><div className="ap-spinner" /><span>Loading users…</span></div>
              ) : users.length === 0 ? (
                <div className="ap-empty">No users found.</div>
              ) : (
                <table className="ap-table">
                  <thead><tr><th>ID</th><th>Username</th><th>Email</th><th>Role</th><th>Status</th><th>Created</th><th>Actions</th></tr></thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u.id} className={`ap-row ${!u.enabled ? 'ap-row-disabled' : ''}`}>
                        <td className="ap-id">#{u.id}</td>
                        <td className="ap-username">{u.role === 'ADMIN' && <span className="ap-crown">👑 </span>}{u.username}</td>
                        <td className="ap-email">{u.email}</td>
                        <td><button className={`ap-badge ${u.role === 'ADMIN' ? 'ap-badge-admin' : 'ap-badge-user'}`} onClick={() => toggleRole(u)}>{u.role}</button></td>
                        <td><button className={`ap-badge ${u.enabled ? 'ap-badge-active' : 'ap-badge-inactive'}`} onClick={() => toggleEnabled(u)}>{u.enabled ? '✅ Active' : '⏳ Pending'}</button></td>
                        <td className="ap-date">{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}</td>
                        <td className="ap-actions">
                          {confirm === u.id ? (
                            <div className="ap-confirm"><span>Sure?</span><button className="ap-btn-confirm" onClick={() => deleteUser(u.id)} disabled={deleting === u.id}>{deleting === u.id ? '…' : 'Yes'}</button><button className="ap-btn-cancel" onClick={() => setConfirm(null)}>No</button></div>
                          ) : (
                            <button className="ap-btn-delete" onClick={() => setConfirm(u.id)} disabled={deleting === u.id}>🗑 Delete</button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}

        {/* ═══════════════════════════════════════════
            EPISODES TAB
            ═══════════════════════════════════════════ */}
        {tab === 'episodes' && (
          <>
            <div className="ap-stats">
              <div className="ap-stat"><span className="ap-stat-num">{episodes.length}</span><span className="ap-stat-label">Episodes</span></div>
              <button className="ap-refresh" onClick={fetchEpisodes}>⟳ Refresh</button>
              <button className="ap-btn-add" onClick={startNewEpisode}>+ New Episode</button>
            </div>

            {/* ── Episode Editor ── */}
            {editing && (
              <div className="ap-editor">
                <h3 className="ap-editor-title">{editing === 'new' ? '✍️ New Episode' : '✏️ Edit Episode'}</h3>

                <div className="ap-editor-row">
                  <label>Series</label>
                  <input value={epForm.series} onChange={e => setEpForm(p => ({ ...p, series: e.target.value }))} />
                  <label>Ep #</label>
                  <input type="number" value={epForm.episodeNumber} onChange={e => setEpForm(p => ({ ...p, episodeNumber: e.target.value }))} style={{ width: 70 }} />
                </div>
                <div className="ap-editor-row">
                  <label>Title</label>
                  <input value={epForm.title} onChange={e => setEpForm(p => ({ ...p, title: e.target.value }))} placeholder="Episode I: ..." />
                </div>
                <div className="ap-editor-row">
                  <label>Subtitle</label>
                  <input value={epForm.subtitle} onChange={e => setEpForm(p => ({ ...p, subtitle: e.target.value }))} placeholder="Short subtitle" />
                </div>

                {/* Raw text input + AI format */}
                <label className="ap-editor-label">📝 Paste raw story text</label>
                <textarea
                  className="ap-editor-textarea"
                  value={epForm.rawText}
                  onChange={e => setEpForm(p => ({ ...p, rawText: e.target.value }))}
                  placeholder="Paste your raw story here, then click '🤖 Format with AI'..."
                  rows={10}
                />
                <div className="ap-editor-actions">
                  <button className="ap-btn-ai" onClick={handleAIFormat} disabled={formatting || !epForm.rawText.trim()}>
                    {formatting ? '⏳ Formatting...' : '🤖 Format with AI'}
                  </button>
                  <button className="ap-btn-preview" onClick={() => setPreview(!preview)} disabled={!epForm.content}>
                    {preview ? '📝 Edit HTML' : '👁 Preview'}
                  </button>
                </div>

                {/* Content: either preview or raw HTML editor */}
                {preview ? (
                  <div className="ap-preview-box ns-content" dangerouslySetInnerHTML={{ __html: epForm.content }} />
                ) : (
                  <>
                    <label className="ap-editor-label">📄 HTML Content</label>
                    <textarea
                      className="ap-editor-textarea ap-editor-html"
                      value={epForm.content}
                      onChange={e => setEpForm(p => ({ ...p, content: e.target.value }))}
                      placeholder="Formatted HTML will appear here after AI formatting, or paste your own..."
                      rows={14}
                    />
                  </>
                )}

                <div className="ap-editor-actions">
                  <button className="ap-btn-save" onClick={handleSaveEpisode} disabled={saving}>
                    {saving ? '💾 Saving...' : '💾 Save Episode'}
                  </button>
                  <button className="ap-btn-cancel" onClick={() => setEditing(null)}>Cancel</button>
                </div>
              </div>
            )}

            {/* ── Episodes Table ── */}
            <div className="ap-table-wrap">
              {epLoading ? (
                <div className="ap-loading"><div className="ap-spinner" /><span>Loading episodes…</span></div>
              ) : episodes.length === 0 ? (
                <div className="ap-empty">No episodes yet. Click "+ New Episode" to create one.</div>
              ) : (
                <table className="ap-table">
                  <thead><tr><th>ID</th><th>Series</th><th>Ep</th><th>Title</th><th>Created</th><th>Actions</th></tr></thead>
                  <tbody>
                    {episodes.map(ep => (
                      <tr key={ep.id} className="ap-row">
                        <td className="ap-id">#{ep.id}</td>
                        <td className="ap-username">{ep.series}</td>
                        <td>{ep.episodeNumber}</td>
                        <td>{ep.title}</td>
                        <td className="ap-date">{ep.createdAt ? new Date(ep.createdAt).toLocaleDateString() : '—'}</td>
                        <td className="ap-actions">
                          <button className="ap-btn-edit" onClick={() => startEditEpisode(ep)}>✏️ Edit</button>
                          <button className="ap-btn-delete" onClick={() => { if (window.confirm('Delete this episode?')) deleteEpisode(ep.id) }}>🗑</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}

        {/* ═══════════════════════════════════════════
            CHAPTERS TAB
            ═══════════════════════════════════════════ */}
        {tab === 'chapters' && (
          <>
            <div className="ap-stats">
              <span className="ap-select-label">Episode</span>
              <select className="ap-select" value={chEpisodeId} onChange={e => selectChapterEpisode(e.target.value)}>
                <option value="">— Select an episode —</option>
                {episodes.map(ep => (
                  <option key={ep.id} value={ep.id}>{ep.series} — Ep {ep.episodeNumber}: {ep.title}</option>
                ))}
              </select>
              <div className="ap-stat"><span className="ap-stat-num">{chapters.length}</span><span className="ap-stat-label">Chapters</span></div>
              <button className="ap-refresh" onClick={() => fetchChapters(chEpisodeId)}>⟳ Refresh</button>
              <button className="ap-btn-add" onClick={startNewChapter}>+ New Chapter</button>
            </div>

            {/* ── Chapter Editor ── */}
            {chEditing && (
              <div className="ap-editor">
                <h3 className="ap-editor-title">{chEditing === 'new' ? '✍️ New Chapter' : '✏️ Edit Chapter'}</h3>

                <div className="ap-editor-row">
                  <label>Ch #</label>
                  <input type="number" value={chForm.chapterNumber} onChange={e => setChForm(p => ({ ...p, chapterNumber: e.target.value }))} style={{ width: 70, flex: 'none' }} />
                  <label>Title</label>
                  <input value={chForm.title} onChange={e => setChForm(p => ({ ...p, title: e.target.value }))} placeholder="Chapter 1" />
                </div>

                <label className="ap-editor-label">📝 Paste raw story text</label>
                <textarea
                  className="ap-editor-textarea"
                  value={chForm.rawText}
                  onChange={e => setChForm(p => ({ ...p, rawText: e.target.value }))}
                  placeholder="Paste your raw story here, then click '🤖 Format with AI'..."
                  rows={10}
                />
                <div className="ap-editor-actions">
                  <button className="ap-btn-ai" onClick={handleChapterAIFormat} disabled={chFormatting || !chForm.rawText.trim()}>
                    {chFormatting ? '⏳ Formatting...' : '🤖 Format with AI'}
                  </button>
                  <button className="ap-btn-preview" onClick={() => setChPreview(!chPreview)} disabled={!chForm.content}>
                    {chPreview ? '📝 Edit HTML' : '👁 Preview'}
                  </button>
                </div>

                {chPreview ? (
                  <div className="ap-preview-box ns-content" dangerouslySetInnerHTML={{ __html: chForm.content }} />
                ) : (
                  <>
                    <label className="ap-editor-label">📄 HTML Content</label>
                    <textarea
                      className="ap-editor-textarea ap-editor-html"
                      value={chForm.content}
                      onChange={e => setChForm(p => ({ ...p, content: e.target.value }))}
                      placeholder="Formatted HTML will appear here after AI formatting, or paste your own..."
                      rows={14}
                    />
                  </>
                )}

                <div className="ap-editor-actions">
                  <button className="ap-btn-save" onClick={handleSaveChapter} disabled={chSaving}>
                    {chSaving ? '💾 Saving...' : '💾 Save Chapter'}
                  </button>
                  <button className="ap-btn-cancel" onClick={() => setChEditing(null)}>Cancel</button>
                </div>
              </div>
            )}

            {/* ── Chapters Table ── */}
            <div className="ap-table-wrap">
              {!chEpisodeId ? (
                <div className="ap-empty">Select an episode above to manage its chapters.</div>
              ) : chLoading ? (
                <div className="ap-loading"><div className="ap-spinner" /><span>Loading chapters…</span></div>
              ) : chapters.length === 0 ? (
                <div className="ap-empty">No chapters yet. Click "+ New Chapter" to create one.</div>
              ) : (
                <table className="ap-table">
                  <thead><tr><th>ID</th><th>Ch</th><th>Title</th><th>Actions</th></tr></thead>
                  <tbody>
                    {chapters.map(c => (
                      <tr key={c.id} className="ap-row">
                        <td className="ap-id">#{c.id}</td>
                        <td>{c.chapterNumber}</td>
                        <td className="ap-username">{c.title || `Chapter ${c.chapterNumber}`}</td>
                        <td className="ap-actions">
                          <button className="ap-btn-edit" onClick={() => startEditChapter(c)}>✏️ Edit</button>
                          <button className="ap-btn-delete" onClick={() => { if (window.confirm('Delete this chapter?')) deleteChapter(c.id) }}>🗑</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}

      </div>
    </div>
  )
}

export default AdminPanel
