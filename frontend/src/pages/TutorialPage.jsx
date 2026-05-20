import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import TriGrid3D from '../components/TriGrid3D'
import { getTutorial } from '../lib/tutorials'
import { renderMarkdown } from '../lib/markdown'
import './TutorialPage.css'

export default function TutorialPage() {
  const { slug, partNum } = useParams()
  const partNumber = parseInt(partNum, 10) || 1

  const tutorial = useMemo(() => getTutorial(slug), [slug])
  const current = tutorial?.parts.find(p => p.partNumber === partNumber) || tutorial?.parts[0] || null

  // Markdown → HTML happens at render time but is memoised per (slug, part).
  const html = useMemo(() => {
    if (!tutorial || !current) return ''
    return renderMarkdown(current.body, { resolveImage: tutorial.resolveImage })
  }, [tutorial, current])

  if (!tutorial) {
    return (
      <div className="tut-read-page">
        <TriGrid3D size={54} color="0,229,255" radius={3} />
        <div className="tut-read-back container">
          <Link to="/tutorials" className="tut-read-back-link">← Back to Tutorials</Link>
        </div>
        <main className="tut-read-body container">
          <div className="tut-read-placeholder"><span>🔍</span><p>Tutorial not found.</p></div>
        </main>
      </div>
    )
  }

  const parts = tutorial.parts
  const totalParts = parts.length
  const currentNum = current?.partNumber || partNumber
  const hasPrev = currentNum > 1
  const hasNext = currentNum < totalParts

  return (
    <div className="tut-read-page">
      <TriGrid3D size={54} color="0,229,255" radius={3} />

      <div className="tut-read-back container">
        <Link to="/tutorials" className="tut-read-back-link">← Back to Tutorials</Link>
      </div>

      <header className="tut-read-header container">
        <span className="sec-tag sec-tag-cyan">🤖 {tutorial.track || 'Tutorial'}</span>
        <h1 className="tut-read-title">{tutorial.title}</h1>
        <div className="tut-read-meta">
          {tutorial.level && <span>📊 {tutorial.level}</span>}
          {tutorial.level && totalParts > 0 && <span className="tut-read-dot">·</span>}
          {totalParts > 0 && (
            <span>📖 {totalParts} Part{totalParts > 1 ? 's' : ''}</span>
          )}
        </div>
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

      {current && totalParts > 1 && (
        <div className="tut-read-part-title container">
          <h2>{current.title}</h2>
        </div>
      )}

      <main className="tut-read-body container">
        {current ? (
          <div className="tut-md" dangerouslySetInnerHTML={{ __html: html }} />
        ) : (
          <div className="tut-read-placeholder"><span>📝</span><p>No parts published yet.</p></div>
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
