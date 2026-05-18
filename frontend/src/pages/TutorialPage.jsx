import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import TriGrid3D from '../components/TriGrid3D'
import './TutorialPage.css'

const API = import.meta.env.VITE_API_URL || ''

export default function TutorialPage() {
  const { slug, partNum } = useParams()
  const part = parseInt(partNum, 10) || 1

  const [tutorial, setTutorial] = useState(null)
  const [parts, setParts] = useState([])
  const [current, setCurrent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    setLoading(true)
    setNotFound(false)

    async function load() {
      try {
        const tRes = await fetch(`${API}/api/tutorials/${slug}`)
        if (tRes.status === 404) { setNotFound(true); return }
        if (!tRes.ok) throw new Error(`Server error (${tRes.status})`)
        const tData = await tRes.json()
        setTutorial(tData)

        const pRes = await fetch(`${API}/api/tutorials/${tData.id}/parts`)
        const pData = pRes.ok ? await pRes.json() : []
        setParts(pData)

        if (pData.length > 0) {
          const target = pData.find(p => p.partNumber === part) || pData[0]
          const dRes = await fetch(`${API}/api/tutorials/${tData.id}/parts/${target.partNumber}`)
          setCurrent(dRes.ok ? await dRes.json() : target)
        } else {
          setCurrent(null)
        }
      } catch (e) {
        console.error('Failed to load tutorial:', e)
        setNotFound(true)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [slug, part])

  const totalParts = parts.length
  const currentNum = current?.partNumber || part
  const hasPrev = currentNum > 1
  const hasNext = currentNum < totalParts

  return (
    <div className="tut-read-page">
      <TriGrid3D size={54} color="0,229,255" radius={3} />

      <div className="tut-read-back container">
        <Link to="/tutorials" className="tut-read-back-link">← Back to Tutorials</Link>
      </div>

      <header className="tut-read-header container">
        <span className="sec-tag sec-tag-cyan">🤖 {tutorial?.track || 'Tutorial'}</span>
        <h1 className="tut-read-title">{tutorial?.title || (loading ? 'Loading…' : 'Tutorial')}</h1>
        {tutorial?.level && (
          <div className="tut-read-meta">
            <span>📊 {tutorial.level}</span>
            {totalParts > 0 && (
              <>
                <span className="tut-read-dot">·</span>
                <span>📖 {totalParts} Part{totalParts > 1 ? 's' : ''}</span>
              </>
            )}
          </div>
        )}
      </header>

      {totalParts > 1 && (
        <nav className="tut-read-nav container">
          {parts.map(p => (
            <Link
              key={p.partNumber}
              to={`/tutorials/${slug}/part/${p.partNumber}`}
              className={`tut-read-tab ${p.partNumber === currentNum ? 'tut-read-tab-active' : ''}`}
            >
              {p.title || `Part ${p.partNumber}`}
            </Link>
          ))}
        </nav>
      )}

      {current && (
        <div className="tut-read-part-title container">
          <h2>{current.title || `Part ${current.partNumber}`}</h2>
        </div>
      )}

      <main className="tut-read-body container">
        {loading && (
          <div className="tut-read-placeholder"><span>⏳</span><p>Loading…</p></div>
        )}
        {notFound && (
          <div className="tut-read-placeholder"><span>🔍</span><p>Tutorial not found.</p></div>
        )}
        {current && (
          <div className="ns-content" dangerouslySetInnerHTML={{ __html: current.content }} />
        )}
        {tutorial && !current && !loading && !notFound && (
          <div className="tut-read-placeholder"><span>📝</span><p>No parts published yet — check back soon.</p></div>
        )}
      </main>

      <div className="tut-read-footer-nav container">
        <div>
          {hasPrev && (
            <Link to={`/tutorials/${slug}/part/${currentNum - 1}`} className="tut-read-back-link">
              ← Previous Part
            </Link>
          )}
        </div>
        <Link to="/tutorials" className="tut-read-back-link">All Tutorials</Link>
        <div>
          {hasNext && (
            <Link to={`/tutorials/${slug}/part/${currentNum + 1}`} className="tut-read-back-link">
              Next Part →
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
