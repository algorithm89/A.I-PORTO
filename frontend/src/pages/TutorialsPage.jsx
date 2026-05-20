import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import TriGrid3D from '../components/TriGrid3D'
import { getTutorials } from '../lib/tutorials'
import './TutorialsPage.css'

const TRACKS = ['All', 'Math for AI', 'Titanic Project', 'Biometric System', 'Accountability Bot']
const LEVELS = ['All Levels', 'Beginner', 'Intermediate', 'Advanced']

const TRACK_COLOR = {
  'Math for AI': 'cyan',
  'Titanic Project': 'pink',
  'Biometric System': 'purple',
  'Accountability Bot': 'yellow',
}

export default function TutorialsPage() {
  // Tutorials are loaded synchronously at build time from /tuts.
  const tutorials = useMemo(() => getTutorials(), [])
  const [track, setTrack] = useState('All')
  const [level, setLevel] = useState('All Levels')

  const filtered = tutorials.filter(t => {
    const trackOk = track === 'All' || t.track === track
    const levelOk = level === 'All Levels' || t.level === level
    return trackOk && levelOk
  })

  return (
    <div className="tut-page">
      <TriGrid3D size={54} color="0,229,255" radius={3} />

      {/* ── Hero ── */}
      <section className="tut-hero">
        <div className="container">
          <span className="sec-tag sec-tag-cyan">🤖 MLOps / AI Tutorials</span>
          <h1 className="tut-hero-title">
            Learn AI without<br />
            <span className="gradient-text">the gatekeeping</span>
          </h1>
          <p className="tut-hero-sub">
            From the math foundations to real-world projects — Titanic predictions,
            biometric systems and an AI accountability bot. No fluff, no imposter syndrome required.
          </p>
          <div className="tut-stats">
            <div className="tut-stat"><span className="tut-stat-num">{tutorials.length}</span><span className="tut-stat-label">Tutorials</span></div>
            <div className="tut-stat"><span className="tut-stat-num">{TRACKS.length - 1}</span><span className="tut-stat-label">Tracks</span></div>
            <div className="tut-stat"><span className="tut-stat-num">Free</span><span className="tut-stat-label">Always</span></div>
          </div>
        </div>
      </section>

      {/* ── Filters ── */}
      <div className="tut-filters container">
        <div className="tut-filter-group">
          <span className="tut-filter-label">Track</span>
          <div className="tut-filter-row">
            {TRACKS.map(t => (
              <button key={t} className={`filter-btn ${track === t ? 'filter-active' : ''}`} onClick={() => setTrack(t)}>{t}</button>
            ))}
          </div>
        </div>
        <div className="tut-filter-group">
          <span className="tut-filter-label">Level</span>
          <div className="tut-filter-row">
            {LEVELS.map(l => (
              <button key={l} className={`filter-btn ${level === l ? 'filter-active' : ''}`} onClick={() => setLevel(l)}>{l}</button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Tutorials grid ── */}
      <section className="tut-grid-section container">
        {filtered.length === 0 ? (
          <div className="tut-empty">
            <span>🤷</span>
            <p>{tutorials.length === 0
              ? 'No tutorials published yet — drop a folder into /tuts to add one.'
              : 'No tutorials match those filters yet.'}</p>
          </div>
        ) : (
          <div className="tut-grid">
            {filtered.map(tut => {
              const color = TRACK_COLOR[tut.track] || 'cyan'
              return (
                <article key={tut.slug} className={`tut-card tc-${color}`}>
                  <div className="tc-top">
                    <span className="tc-emoji">🤖</span>
                    <div className="tc-top-right">
                      {tut.track && <span className={`tc-track tc-track-${color}`}>{tut.track}</span>}
                      {tut.level && <span className={`tc-level tc-level-${tut.level.toLowerCase()}`}>{tut.level}</span>}
                    </div>
                  </div>

                  <h2 className="tc-title">{tut.title}</h2>
                  <p className="tc-excerpt">{tut.excerpt}</p>

                  <div className="tc-footer">
                    <div className="tc-actions">
                      <Link to={`/tutorials/${tut.slug}/part/1`} className={`tc-btn tc-btn-${color}`}>Read →</Link>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </section>

      {/* ── CTA ── */}
      <section className="tut-cta container">
        <div className="tut-cta-inner neon-border-pink">
          <div>
            <p className="tut-cta-label">Looking for personal writing &amp; reflections?</p>
            <h3 className="tut-cta-title">Visit the <span className="gradient-text">Blog</span></h3>
          </div>
          <Link to="/blog" className="btn-neon-pink">Go to Blog →</Link>
        </div>
      </section>
    </div>
  )
}
