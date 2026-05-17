import { useState, useEffect, useCallback } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import HexGrid from '../components/HexGrid'
import pic10 from '../assets/PIC10.png'
import './NeonSpiritEp1Page.css'

const API = import.meta.env.VITE_API_URL || ''
const SERIES = 'Neon Spirit'

const ROMAN = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X']

// Read ADMIN status straight from the JWT in localStorage.
function getIsAdmin() {
  const token = localStorage.getItem('token')
  if (!token) return false
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    if (payload.exp * 1000 < Date.now()) return false
    return payload.role === 'ADMIN'
  } catch {
    return false
  }
}

export default function NeonSpiritEpPage() {
  const { epNum, chNum } = useParams()
  const navigate = useNavigate()
  const ep = parseInt(epNum, 10) || 1
  const ch = parseInt(chNum, 10) || 1

  const [episode, setEpisode] = useState(null)
  const [chapters, setChapters] = useState([])
  const [chapter, setChapter] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  // ── Admin inline editor ──
  const [isAdmin] = useState(getIsAdmin)
  const [editMode, setEditMode] = useState(false)
  const [editForm, setEditForm] = useState({ subtitle: '', title: '', rawText: '', content: '' })
  const [previewMode, setPreviewMode] = useState(false)
  const [formatting, setFormatting] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editError, setEditError] = useState(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setNotFound(false)
    try {
      const token = localStorage.getItem('token')
      const headers = token ? { Authorization: `Bearer ${token}` } : {}
      const epRes = await fetch(`${API}/api/episodes/series/${encodeURIComponent(SERIES)}/ep/${ep}`, { headers })
      if (epRes.status === 404) { setEpisode(null); setChapters([]); setChapter(null); setNotFound(true); return }
      if (!epRes.ok) throw new Error(`Server error (${epRes.status})`)
      const epData = await epRes.json()
      setEpisode(epData)

      const chRes = await fetch(`${API}/api/episodes/${epData.id}/chapters`, { headers })
      const chData = chRes.ok ? await chRes.json() : []
      setChapters(chData)

      if (chData.length > 0) {
        const targetCh = chData.find(c => c.chapterNumber === ch) || chData[0]
        const detailRes = await fetch(`${API}/api/episodes/${epData.id}/chapters/${targetCh.chapterNumber}`, { headers })
        setChapter(detailRes.ok ? await detailRes.json() : targetCh)
      } else {
        setChapter(null)
      }
    } catch (e) {
      console.error('Failed to load:', e)
      setNotFound(true)
    } finally {
      setLoading(false)
    }
  }, [ep, ch])

  useEffect(() => {
    setEditMode(false)
    fetchData()
  }, [fetchData])

  const roman = ROMAN[ep] || ep
  const subtitle = episode?.subtitle || 'Coming Soon'
  const totalChapters = chapters.length
  const currentCh = chapter?.chapterNumber || ch
  const hasPrev = currentCh > 1
  const hasNext = currentCh < totalChapters

  // ═══════════════════════════════════════════
  //  ADMIN EDITOR ACTIONS
  // ═══════════════════════════════════════════
  function openEditor() {
    setEditForm({
      subtitle: episode?.subtitle || '',
      title: chapter?.title || `Chapter ${ch}`,
      rawText: '',
      content: chapter?.content || '',
    })
    setPreviewMode(false)
    setEditError(null)
    setEditMode(true)
  }

  function addChapter() {
    navigate(`/cartoons/neon-spirit/ep/${ep}/ch/${totalChapters + 1}`)
  }

  async function handleAIFormat() {
    if (!editForm.rawText.trim()) { setEditError('Paste some story text first.'); return }
    setFormatting(true)
    setEditError(null)
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${API}/api/admin/episodes/format`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawText: editForm.rawText }),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.message || 'AI formatting failed')
      setEditForm(p => ({ ...p, content: data.message }))
      setPreviewMode(true)
    } catch (e) {
      setEditError(e.message)
    } finally {
      setFormatting(false)
    }
  }

  async function handleSave() {
    if (!editForm.content.trim()) { setEditError('Nothing to save — format or paste content first.'); return }
    setSaving(true)
    setEditError(null)
    try {
      const token = localStorage.getItem('token')
      const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }

      // 1. Create the episode first if it doesn't exist yet (blank page → real page).
      let episodeId = episode?.id
      if (!episodeId) {
        const epRes = await fetch(`${API}/api/admin/episodes`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            series: SERIES,
            episodeNumber: ep,
            title: `Episode ${roman}: ${editForm.subtitle.trim() || 'Untitled'}`,
            subtitle: editForm.subtitle.trim(),
            coverImage: 'PIC10.png',
            content: '',
          }),
        })
        if (!epRes.ok) throw new Error(`Episode create failed (${epRes.status})`)
        episodeId = (await epRes.json()).id
      }

      // 2. Create or update the chapter.
      let res
      if (chapter?.id) {
        res = await fetch(`${API}/api/admin/chapters/${chapter.id}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify({
            chapterNumber: chapter.chapterNumber,
            title: editForm.title,
            content: editForm.content,
          }),
        })
      } else {
        res = await fetch(`${API}/api/admin/chapters?episodeId=${episodeId}`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            chapterNumber: ch,
            title: editForm.title,
            content: editForm.content,
          }),
        })
      }
      if (!res.ok) throw new Error(`Save failed (${res.status})`)
      setEditMode(false)
      await fetchData()
    } catch (e) {
      setEditError(e.message)
    } finally {
      setSaving(false)
    }
  }

  const isNewEpisode = !episode
  const editorHeading = isNewEpisode
    ? '✍️ Create New Episode'
    : chapter ? '✏️ Edit Chapter' : '✍️ Write New Chapter'

  return (
    <div className="ns-page">
      <HexGrid color="255,230,0" radius={3} />

      <div className="ns-back container">
        <Link to="/cartoons" className="ns-back-link">← Back to Cartoon Blog</Link>
      </div>

      {/* ── Cover image ── */}
      <div className="ns-cover container">
        <img src={pic10} alt="Neon Spirit" className="ns-cover-img" />
      </div>

      {/* ── Episode header ── */}
      <header className="ns-header container">
        <span className="sec-tag sec-tag-yellow">🎨 Neon Spirit</span>
        <h1 className="ns-title">
          Episode {roman}:<br />
          <span className="gradient-text-yellow">{subtitle}</span>
        </h1>
        <div className="ns-meta">
          <span>📅 {episode?.createdAt
            ? new Date(episode.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
            : 'Coming Soon'}</span>
          <span className="ns-dot">·</span>
          <span>✍️ BublikStudios</span>
          {totalChapters > 0 && <><span className="ns-dot">·</span><span>📖 {totalChapters} Chapter{totalChapters > 1 ? 's' : ''}</span></>}
        </div>
        <div className="ns-tags">
          <span className="ns-tag">#neon-spirit</span>
          <span className="ns-tag">#original</span>
          <span className="ns-tag">#episode-{ep}</span>
        </div>
      </header>

      {/* ── Admin toolbar ── */}
      {isAdmin && !editMode && !loading && (
        <div className="ns-admin-bar container">
          <span className="ns-admin-label">👑 Admin</span>
          <div className="ns-admin-actions">
            <button className="ns-admin-edit-btn" onClick={openEditor}>
              {isNewEpisode
                ? '✍️ Create This Episode'
                : chapter ? '✏️ Edit This Chapter' : '✍️ Write This Chapter'}
            </button>
            {!isNewEpisode && totalChapters > 0 && (
              <button className="ns-admin-add-btn" onClick={addChapter}>
                ➕ Add Chapter
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── Chapter navigation tabs ── */}
      {totalChapters > 1 && !editMode && (
        <nav className="ns-chapter-nav container">
          {chapters.map(c => (
            <Link
              key={c.chapterNumber}
              to={`/cartoons/neon-spirit/ep/${ep}/ch/${c.chapterNumber}`}
              className={`ns-chapter-tab ${c.chapterNumber === currentCh ? 'ns-chapter-tab-active' : ''}`}
            >
              {c.title || `Chapter ${c.chapterNumber}`}
            </Link>
          ))}
        </nav>
      )}

      {/* ── Chapter header ── */}
      {chapter && !editMode && (
        <div className="ns-chapter-header container">
          <h2 className="ns-chapter-title">
            {chapter.title || `Chapter ${chapter.chapterNumber}`}
          </h2>
        </div>
      )}

      {/* ── Script body ── */}
      <main className="ns-body container">
        {editMode ? (
          <div className="ns-editor">
            <h2 className="ns-editor-heading">{editorHeading}</h2>

            {editError && (
              <div className="ns-editor-error">
                ⚠️ {editError}
                <button onClick={() => setEditError(null)} aria-label="Dismiss">✕</button>
              </div>
            )}

            {isNewEpisode && (
              <>
                <label className="ns-editor-label">Episode subtitle (shown in the big header)</label>
                <input
                  className="ns-editor-input"
                  value={editForm.subtitle}
                  onChange={e => setEditForm(p => ({ ...p, subtitle: e.target.value }))}
                  placeholder="e.g. The Awakening"
                />
              </>
            )}

            <label className="ns-editor-label">Chapter title</label>
            <input
              className="ns-editor-input"
              value={editForm.title}
              onChange={e => setEditForm(p => ({ ...p, title: e.target.value }))}
              placeholder="Chapter 1"
            />

            <label className="ns-editor-label">📝 Paste your raw story</label>
            <textarea
              className="ns-editor-textarea"
              value={editForm.rawText}
              onChange={e => setEditForm(p => ({ ...p, rawText: e.target.value }))}
              placeholder="Paste your story here, then click 🤖 Format with AI…"
              rows={14}
            />

            <div className="ns-editor-actions">
              <button
                className="ns-btn-ai"
                onClick={handleAIFormat}
                disabled={formatting || !editForm.rawText.trim()}
              >
                {formatting ? '⏳ Formatting…' : '🤖 Format with AI'}
              </button>
              <button
                className="ns-btn-toggle"
                onClick={() => setPreviewMode(!previewMode)}
                disabled={!editForm.content}
              >
                {previewMode ? '📝 Edit HTML' : '👁 Preview'}
              </button>
            </div>

            {previewMode ? (
              <div
                className="ns-editor-preview ns-content"
                dangerouslySetInnerHTML={{ __html: editForm.content }}
              />
            ) : (
              <>
                <label className="ns-editor-label">📄 Formatted HTML</label>
                <textarea
                  className="ns-editor-textarea ns-editor-html"
                  value={editForm.content}
                  onChange={e => setEditForm(p => ({ ...p, content: e.target.value }))}
                  placeholder="Formatted HTML appears here after AI formatting — or write/paste your own."
                  rows={16}
                />
              </>
            )}

            <div className="ns-editor-actions">
              <button className="ns-btn-save" onClick={handleSave} disabled={saving}>
                {saving ? '💾 Saving…' : '💾 Save'}
              </button>
              <button className="ns-btn-cancel-edit" onClick={() => setEditMode(false)}>
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            {loading && (
              <div className="ns-script-placeholder">
                <span>⏳</span>
                <p>Loading chapter…</p>
              </div>
            )}
            {notFound && (
              <div className="ns-script-placeholder">
                <span>✍️</span>
                <p>Episode {roman} is coming soon — stay tuned.</p>
              </div>
            )}
            {chapter && (
              <div
                className="ns-content"
                dangerouslySetInnerHTML={{ __html: chapter.content }}
              />
            )}
            {episode && !chapter && !loading && !notFound && (
              episode.content
                ? <div className="ns-content" dangerouslySetInnerHTML={{ __html: episode.content }} />
                : (
                  <div className="ns-script-placeholder">
                    <span>📝</span>
                    <p>No chapters yet. The author is working on it!</p>
                  </div>
                )
            )}
          </>
        )}
      </main>

      {/* ── Footer: prev / all / next chapter ── */}
      {!editMode && (
        <div className="ns-footer-nav container">
          <div>
            {hasPrev && (
              <Link to={`/cartoons/neon-spirit/ep/${ep}/ch/${currentCh - 1}`} className="ns-back-link">
                ← Previous Chapter
              </Link>
            )}
          </div>
          <Link to={`/cartoons/neon-spirit/ep/${ep}/ch/1`} className="ns-back-link">All Chapters</Link>
          <div>
            {hasNext && (
              <Link to={`/cartoons/neon-spirit/ep/${ep}/ch/${currentCh + 1}`} className="ns-back-link">
                Next Chapter →
              </Link>
            )}
          </div>
        </div>
      )}

      {/* ── Episode navigation ── */}
      {!editMode && (
        <div className="ns-footer-nav container ns-episode-nav">
          {ep > 1 && (
            <Link to={`/cartoons/neon-spirit/ep/${ep - 1}/ch/1`} className="ns-back-link">
              ← Episode {ROMAN[ep - 1]}
            </Link>
          )}
          <Link to="/cartoons" className="ns-back-link">All Stories</Link>
          <Link to={`/cartoons/neon-spirit/ep/${ep + 1}/ch/1`} className="ns-back-link">
            Episode {ROMAN[ep + 1] || ep + 1} →
          </Link>
        </div>
      )}
    </div>
  )
}
