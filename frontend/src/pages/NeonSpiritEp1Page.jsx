import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import HexGrid from '../components/HexGrid'
import pic10 from '../assets/PIC10.png'
import './NeonSpiritEp1Page.css'

const API = import.meta.env.VITE_API_URL || ''

const ROMAN = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X']

export default function NeonSpiritEpPage() {
  const { epNum, chNum } = useParams()
  const ep = parseInt(epNum, 10) || 1
  const ch = parseInt(chNum, 10) || 1

  const [episode, setEpisode] = useState(null)
  const [chapters, setChapters] = useState([])
  const [chapter, setChapter] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    setLoading(true)
    setNotFound(false)

    async function fetchData() {
      try {
        const epRes = await fetch(`${API}/api/episodes/series/Neon%20Spirit/ep/${ep}`)
        if (epRes.status === 404) { setNotFound(true); return }
        if (!epRes.ok) throw new Error(`Server error (${epRes.status})`)
        const epData = await epRes.json()
        setEpisode(epData)

        const chRes = await fetch(`${API}/api/episodes/${epData.id}/chapters`)
        const chData = chRes.ok ? await chRes.json() : []
        setChapters(chData)

        if (chData.length > 0) {
          const targetCh = chData.find(c => c.chapterNumber === ch) || chData[0]
          const detailRes = await fetch(`${API}/api/episodes/${epData.id}/chapters/${targetCh.chapterNumber}`)
          if (detailRes.ok) {
            setChapter(await detailRes.json())
          } else {
            setChapter(targetCh)
          }
        }
      } catch (e) {
        console.error('Failed to load:', e)
        setNotFound(true)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [ep, ch])

  const roman = ROMAN[ep] || ep
  const subtitle = episode?.subtitle || 'Coming Soon'
  const totalChapters = chapters.length
  const currentCh = chapter?.chapterNumber || ch
  const hasPrev = currentCh > 1
  const hasNext = currentCh < totalChapters

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

      {/* ── Chapter navigation tabs ── */}
      {totalChapters > 1 && (
        <nav className="ns-chapter-nav container">
          {chapters.map(c => (
            <Link
              key={c.chapterNumber}
              to={`/cartoons/neon-spirit/ep/${ep}/ch/${c.chapterNumber}`}
              className={`ns-chapter-tab ${c.chapterNumber === currentCh ? 'ns-chapter-tab-active' : ''}`}
            >
              {c.title || `Ch ${c.chapterNumber}`}
            </Link>
          ))}
        </nav>
      )}

      {/* ── Chapter header ── */}
      {chapter && (
        <div className="ns-chapter-header container">
          <h2 className="ns-chapter-title">
            {chapter.title || `Chapter ${chapter.chapterNumber}`}
          </h2>
        </div>
      )}

      {/* ── Script body ── */}
      <main className="ns-body container">
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
          <div className="ns-script-placeholder">
            <span>📝</span>
            <p>No chapters yet. The author is working on it!</p>
          </div>
        )}
      </main>

      {/* ── Footer: prev / all / next chapter ── */}
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

      {/* ── Episode navigation ── */}
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
    </div>
  )
}