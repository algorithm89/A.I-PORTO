import { useState, useEffect, useCallback } from 'react'
import ImageUploadButton from './ImageUploadButton'

const API = import.meta.env.VITE_API_URL || ''
const TRACKS = ['Math for AI', 'Titanic Project', 'Biometric System', 'Accountability Bot']
const LEVELS = ['Beginner', 'Intermediate', 'Advanced']

// Tutorials tab of the Admin Panel: manage tutorials and their parts.
export default function AdminTutorials({ token, onError }) {
  const authHeaders = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }

  // ── Tutorials ──
  const [tutorials, setTutorials] = useState([])
  const [tutLoading, setTutLoading] = useState(true)
  const [tutId, setTutId] = useState('')
  const [tutEditing, setTutEditing] = useState(null) // 'new' | id | null
  const [tutForm, setTutForm] = useState({ slug: '', title: '', track: 'Biometric System', level: 'Beginner', excerpt: '' })
  const [tutSaving, setTutSaving] = useState(false)

  // ── Parts ──
  const [parts, setParts] = useState([])
  const [partLoading, setPartLoading] = useState(false)
  const [partEditing, setPartEditing] = useState(null) // 'new' | id | null
  const [partForm, setPartForm] = useState({ partNumber: '', title: '', rawText: '', content: '' })
  const [partFormatting, setPartFormatting] = useState(false)
  const [partSaving, setPartSaving] = useState(false)
  const [partPreview, setPartPreview] = useState(false)

  const fetchTutorials = useCallback(async () => {
    setTutLoading(true)
    try {
      const res = await fetch(`${API}/api/tutorials`)
      if (!res.ok) throw new Error(`Server returned ${res.status}`)
      setTutorials(await res.json())
    } catch (e) { onError(e.message) }
    finally { setTutLoading(false) }
  }, [onError])

  useEffect(() => { fetchTutorials() }, [fetchTutorials])

  const fetchParts = useCallback(async (id) => {
    if (!id) { setParts([]); return }
    setPartLoading(true)
    try {
      const res = await fetch(`${API}/api/tutorials/${id}/parts`)
      if (!res.ok) throw new Error(`Server returned ${res.status}`)
      setParts(await res.json())
    } catch (e) { onError(e.message) }
    finally { setPartLoading(false) }
  }, [onError])

  function selectTutorial(id) {
    setTutId(id)
    setTutEditing(null)
    setPartEditing(null)
    fetchParts(id)
  }

  // ── Tutorial CRUD ──
  function startNewTutorial() {
    setTutEditing('new')
    setTutForm({ slug: '', title: '', track: 'Biometric System', level: 'Beginner', excerpt: '' })
  }

  function startEditTutorial() {
    const t = tutorials.find(x => String(x.id) === String(tutId))
    if (!t) { onError('Pick a tutorial first.'); return }
    setTutEditing(t.id)
    setTutForm({
      slug: t.slug, title: t.title,
      track: t.track || 'Biometric System', level: t.level || 'Beginner',
      excerpt: t.excerpt || '',
    })
  }

  async function saveTutorial() {
    if (!tutForm.slug.trim() || !tutForm.title.trim()) { onError('Slug and title are required.'); return }
    setTutSaving(true)
    try {
      const url = tutEditing === 'new' ? `${API}/api/admin/tutorials` : `${API}/api/admin/tutorials/${tutEditing}`
      const method = tutEditing === 'new' ? 'POST' : 'PUT'
      const res = await fetch(url, { method, headers: authHeaders, body: JSON.stringify(tutForm) })
      if (!res.ok) throw new Error(`Save failed: ${res.status}`)
      const saved = await res.json()
      setTutEditing(null)
      await fetchTutorials()
      setTutId(String(saved.id))
      fetchParts(saved.id)
    } catch (e) { onError(e.message) }
    finally { setTutSaving(false) }
  }

  async function deleteTutorial() {
    const t = tutorials.find(x => String(x.id) === String(tutId))
    if (!t) return
    if (!window.confirm(`Delete tutorial "${t.title}" and all its parts?`)) return
    try {
      const res = await fetch(`${API}/api/admin/tutorials/${t.id}`, {
        method: 'DELETE', headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error(`Delete failed: ${res.status}`)
      setTutId('')
      setParts([])
      fetchTutorials()
    } catch (e) { onError(e.message) }
  }

  // ── Part CRUD ──
  function startNewPart() {
    if (!tutId) { onError('Pick a tutorial first.'); return }
    setPartEditing('new')
    setPartForm({ partNumber: parts.length + 1, title: '', rawText: '', content: '' })
    setPartPreview(false)
  }

  function startEditPart(p) {
    setPartEditing(p.id)
    setPartForm({ partNumber: p.partNumber, title: p.title || '', rawText: '', content: p.content || '' })
    setPartPreview(false)
  }

  async function formatPart() {
    if (!partForm.rawText.trim()) { onError('Paste some text first.'); return }
    setPartFormatting(true)
    try {
      const res = await fetch(`${API}/api/admin/episodes/format`, {
        method: 'POST', headers: authHeaders,
        body: JSON.stringify({ rawText: partForm.rawText }),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.message)
      setPartForm(p => ({ ...p, content: data.message }))
      setPartPreview(true)
    } catch (e) { onError(e.message) }
    finally { setPartFormatting(false) }
  }

  async function savePart() {
    if (!tutId || !partForm.partNumber) { onError('Tutorial and part number are required.'); return }
    setPartSaving(true)
    try {
      const body = {
        partNumber: parseInt(partForm.partNumber, 10),
        title: partForm.title,
        content: partForm.content,
      }
      const url = partEditing === 'new'
        ? `${API}/api/admin/tutorials/${tutId}/parts`
        : `${API}/api/admin/tutorials/parts/${partEditing}`
      const method = partEditing === 'new' ? 'POST' : 'PUT'
      const res = await fetch(url, { method, headers: authHeaders, body: JSON.stringify(body) })
      if (!res.ok) throw new Error(`Save failed: ${res.status}`)
      setPartEditing(null)
      fetchParts(tutId)
    } catch (e) { onError(e.message) }
    finally { setPartSaving(false) }
  }

  async function deletePart(id) {
    if (!window.confirm('Delete this part?')) return
    try {
      const res = await fetch(`${API}/api/admin/tutorials/parts/${id}`, {
        method: 'DELETE', headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error(`Delete failed: ${res.status}`)
      setParts(prev => prev.filter(p => p.id !== id))
    } catch (e) { onError(e.message) }
  }

  const selectedTut = tutorials.find(x => String(x.id) === String(tutId))

  return (
    <>
      {/* ── Tutorial selector ── */}
      <div className="ap-stats">
        <span className="ap-select-label">Tutorial</span>
        <select className="ap-select" value={tutId} onChange={e => selectTutorial(e.target.value)}>
          <option value="">— Select a tutorial —</option>
          {tutorials.map(t => (
            <option key={t.id} value={t.id}>{t.title}</option>
          ))}
        </select>
        {selectedTut && <button className="ap-btn-edit" onClick={startEditTutorial}>✏️ Edit info</button>}
        {selectedTut && <button className="ap-btn-delete" onClick={deleteTutorial}>🗑 Delete</button>}
        <button className="ap-refresh" onClick={fetchTutorials}>⟳ Refresh</button>
        <button className="ap-btn-add" onClick={startNewTutorial}>+ New Tutorial</button>
      </div>

      {/* ── Tutorial info editor ── */}
      {tutEditing && (
        <div className="ap-editor">
          <h3 className="ap-editor-title">{tutEditing === 'new' ? '✍️ New Tutorial' : '✏️ Edit Tutorial'}</h3>
          <div className="ap-editor-row">
            <label>Title</label>
            <input value={tutForm.title} onChange={e => setTutForm(p => ({ ...p, title: e.target.value }))}
              placeholder="Build a Face Recognition System in Python" />
          </div>
          <div className="ap-editor-row">
            <label>Slug</label>
            <input value={tutForm.slug} onChange={e => setTutForm(p => ({ ...p, slug: e.target.value }))}
              placeholder="face-recognition  (used in the URL)" />
          </div>
          <div className="ap-editor-row">
            <label>Track</label>
            <select className="ap-select" value={tutForm.track} onChange={e => setTutForm(p => ({ ...p, track: e.target.value }))}>
              {TRACKS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <label>Level</label>
            <select className="ap-select" value={tutForm.level} onChange={e => setTutForm(p => ({ ...p, level: e.target.value }))}>
              {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <div className="ap-editor-row">
            <label>Excerpt</label>
            <input value={tutForm.excerpt} onChange={e => setTutForm(p => ({ ...p, excerpt: e.target.value }))}
              placeholder="Short description shown on the tutorial card" />
          </div>
          <div className="ap-editor-actions">
            <button className="ap-btn-save" onClick={saveTutorial} disabled={tutSaving}>
              {tutSaving ? '💾 Saving...' : '💾 Save Tutorial'}
            </button>
            <button className="ap-btn-cancel" onClick={() => setTutEditing(null)}>Cancel</button>
          </div>
        </div>
      )}

      {/* ── Parts of the selected tutorial ── */}
      {selectedTut && !tutEditing && (
        <>
          <div className="ap-stats">
            <div className="ap-stat"><span className="ap-stat-num">{parts.length}</span><span className="ap-stat-label">Parts</span></div>
            <span className="ap-select-label">{selectedTut.title}</span>
            <button className="ap-refresh" onClick={() => fetchParts(tutId)}>⟳ Refresh</button>
            <button className="ap-btn-add" onClick={startNewPart}>+ New Part</button>
          </div>

          {partEditing && (
            <div className="ap-editor">
              <h3 className="ap-editor-title">{partEditing === 'new' ? '✍️ New Part' : '✏️ Edit Part'}</h3>
              <div className="ap-editor-row">
                <label>Part #</label>
                <input type="number" value={partForm.partNumber}
                  onChange={e => setPartForm(p => ({ ...p, partNumber: e.target.value }))}
                  style={{ width: 70, flex: 'none' }} />
                <label>Title</label>
                <input value={partForm.title} onChange={e => setPartForm(p => ({ ...p, title: e.target.value }))}
                  placeholder="Part 1: Setting Up Your Environment" />
              </div>

              <label className="ap-editor-label">📝 Paste raw tutorial text</label>
              <textarea
                className="ap-editor-textarea"
                value={partForm.rawText}
                onChange={e => setPartForm(p => ({ ...p, rawText: e.target.value }))}
                placeholder="Paste your raw tutorial text here, then click '🤖 Format with AI'..."
                rows={10}
              />
              <div className="ap-editor-actions">
                <button className="ap-btn-ai" onClick={formatPart} disabled={partFormatting || !partForm.rawText.trim()}>
                  {partFormatting ? '⏳ Formatting...' : '🤖 Format with AI'}
                </button>
                <button className="ap-btn-preview" onClick={() => setPartPreview(!partPreview)} disabled={!partForm.content}>
                  {partPreview ? '📝 Edit HTML' : '👁 Preview'}
                </button>
                <ImageUploadButton
                  token={token}
                  onError={onError}
                  onUploaded={url => {
                    setPartForm(p => ({ ...p, content: `${p.content}\n<img src="${url}" alt="" />\n` }))
                    setPartPreview(false)
                  }}
                />
              </div>

              {partPreview ? (
                <div className="ap-preview-box ns-content" dangerouslySetInnerHTML={{ __html: partForm.content }} />
              ) : (
                <>
                  <label className="ap-editor-label">📄 HTML Content</label>
                  <textarea
                    className="ap-editor-textarea ap-editor-html"
                    value={partForm.content}
                    onChange={e => setPartForm(p => ({ ...p, content: e.target.value }))}
                    placeholder="Formatted HTML will appear here after AI formatting, or paste your own..."
                    rows={14}
                  />
                </>
              )}

              <div className="ap-editor-actions">
                <button className="ap-btn-save" onClick={savePart} disabled={partSaving}>
                  {partSaving ? '💾 Saving...' : '💾 Save Part'}
                </button>
                <button className="ap-btn-cancel" onClick={() => setPartEditing(null)}>Cancel</button>
              </div>
            </div>
          )}

          <div className="ap-table-wrap">
            {partLoading ? (
              <div className="ap-loading"><div className="ap-spinner" /><span>Loading parts…</span></div>
            ) : parts.length === 0 ? (
              <div className="ap-empty">No parts yet. Click "+ New Part" to create one.</div>
            ) : (
              <table className="ap-table">
                <thead><tr><th>ID</th><th>Part</th><th>Title</th><th>Actions</th></tr></thead>
                <tbody>
                  {parts.map(p => (
                    <tr key={p.id} className="ap-row">
                      <td className="ap-id">#{p.id}</td>
                      <td>{p.partNumber}</td>
                      <td className="ap-username">{p.title || `Part ${p.partNumber}`}</td>
                      <td className="ap-actions">
                        <button className="ap-btn-edit" onClick={() => startEditPart(p)}>✏️ Edit</button>
                        <button className="ap-btn-delete" onClick={() => deletePart(p.id)}>🗑</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

      {!selectedTut && !tutEditing && (
        <div className="ap-table-wrap">
          {tutLoading ? (
            <div className="ap-loading"><div className="ap-spinner" /><span>Loading tutorials…</span></div>
          ) : (
            <div className="ap-empty">Select a tutorial above, or click “+ New Tutorial” to create one.</div>
          )}
        </div>
      )}
    </>
  )
}
