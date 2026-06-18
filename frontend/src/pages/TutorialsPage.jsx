import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import TriGrid3D from '../components/TriGrid3D'
import { getTutorials } from '../lib/tutorials'
import './TutorialsPage.css'

const LEVELS = ['All Levels', 'Beginner', 'Intermediate', 'Advanced']

const TRACK_COLOR = {
  'Math for AI': 'cyan',
  'Titanic Project': 'pink',
  'Biometric System': 'purple',
  'Accountability Bot': 'yellow',
}

// ── Two journeys the site tells a story around ──
// Every track belongs to one "domain". A.I. is live; DevOps is the next
// chapter — shown as coming-soon so visitors know it's on the way.
const DOMAINS = {
  ai: {
    key: 'ai',
    label: 'A.I.',
    icon: '🤖',
    color: 'cyan',
    status: 'live',
    headline: 'Teach machines to see, predict & decide.',
    blurb: 'Start at the math, end with real systems — face recognition, survival predictions, an accountability bot.',
    tracks: ['Math for AI', 'Titanic Project', 'Biometric System', 'Accountability Bot'],
  },
  devops: {
    key: 'devops',
    label: 'DevOps',
    icon: '🛠️',
    color: 'green',
    status: 'soon',
    headline: 'Ship it, scale it, keep it alive at 3am.',
    blurb: 'The other half of the story: containers, pipelines and clusters — how the models you build actually reach the world.',
    tracks: ['Docker & Containers', 'CI/CD Pipelines', 'Kubernetes', 'Linux & Cloud'],
  },
}

function domainOfTrack(track) {
  return DOMAINS.devops.tracks.includes(track) ? 'devops' : 'ai'
}

export default function TutorialsPage() {
  // Tutorials are loaded synchronously at build time from /tuts.
  const tutorials = useMemo(() => getTutorials(), [])
  const [domain, setDomain] = useState('all')   // 'all' | 'ai' | 'devops'
  const [track, setTrack] = useState('All')
  const [level, setLevel] = useState('All Levels')

  const countFor = (key) => tutorials.filter(t => domainOfTrack(t.track) === key).length

  // Track pills are contextual to the chosen domain.
  const trackPills = useMemo(() => {
    if (domain === 'devops') return ['All', ...DOMAINS.devops.tracks]
    if (domain === 'ai') return ['All', ...DOMAINS.ai.tracks]
    return ['All', ...DOMAINS.ai.tracks]
  }, [domain])

  const pickDomain = (key) => {
    setDomain(key)
    setTrack('All')
    const grid = document.getElementById('tut-grid-anchor')
    if (grid) grid.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const filtered = tutorials.filter(t => {
    const domainOk = domain === 'all' || domainOfTrack(t.track) === domain
    const trackOk = track === 'All' || t.track === track
    const levelOk = level === 'All Levels' || t.level === level
    return domainOk && trackOk && levelOk
  })

  const showDevOpsSoon = domain === 'devops'

  return (
    <div className="tut-page">
      <TriGrid3D size={54} color="0,229,255" radius={3} />

      {/* ── Hero ── */}
      <section className="tut-hero">
        <div className="container">
          <span className="sec-tag sec-tag-cyan reveal">🤖 DevOps &amp; A.I. Tutorials</span>
          <h1 className="tut-hero-title reveal" style={{ animationDelay: '0.08s' }}>
            Every engineer has<br />
            <span className="gradient-text gradient-shimmer">two journeys</span>
          </h1>
          <p className="tut-hero-sub reveal" style={{ animationDelay: '0.16s' }}>
            One teaches machines to think — the other teaches the world to run them.
            This is where both stories get told, from the very first line, with no gatekeeping.
          </p>
          <div className="tut-stats reveal" style={{ animationDelay: '0.24s' }}>
            <div className="tut-stat"><span className="tut-stat-num">{tutorials.length}</span><span className="tut-stat-label">Tutorials</span></div>
            <div className="tut-stat"><span className="tut-stat-num">2</span><span className="tut-stat-label">Journeys</span></div>
            <div className="tut-stat"><span className="tut-stat-num">Free</span><span className="tut-stat-label">Always</span></div>
          </div>
        </div>
      </section>

      {/* ── Choose your path (the storytelling centerpiece) ── */}
      <section className="tut-paths container">
        {Object.values(DOMAINS).map((d, i) => (
          <button
            key={d.key}
            className={`path-card pc-${d.color} ${domain === d.key ? 'pc-active' : ''} reveal`}
            style={{ animationDelay: `${0.3 + i * 0.1}s` }}
            onClick={() => pickDomain(d.key)}
            aria-pressed={domain === d.key}
          >
            <div className="pc-glow" aria-hidden="true" />
            <div className="pc-head">
              <span className="pc-icon">{d.icon}</span>
              {d.status === 'live'
                ? <span className="pc-badge pc-badge-live">{countFor(d.key)} live</span>
                : <span className="pc-badge pc-badge-soon">Coming soon</span>}
            </div>
            <h2 className="pc-label">{d.label}</h2>
            <p className="pc-headline">{d.headline}</p>
            <p className="pc-blurb">{d.blurb}</p>
            <div className="pc-tracks">
              {d.tracks.map(t => <span key={t} className="pc-track-chip">{t}</span>)}
            </div>
            <span className="pc-cta">{d.status === 'live' ? 'Explore the path →' : 'Peek at what’s coming →'}</span>
          </button>
        ))}
      </section>

      {/* ── Filters ── */}
      <div id="tut-grid-anchor" className="tut-filters container">
        <div className="tut-filter-group">
          <span className="tut-filter-label">Journey</span>
          <div className="tut-filter-row">
            <button className={`filter-btn ${domain === 'all' ? 'filter-active' : ''}`} onClick={() => { setDomain('all'); setTrack('All') }}>All</button>
            <button className={`filter-btn ${domain === 'ai' ? 'filter-active' : ''}`} onClick={() => { setDomain('ai'); setTrack('All') }}>🤖 A.I.</button>
            <button className={`filter-btn fb-green ${domain === 'devops' ? 'filter-active fb-green-active' : ''}`} onClick={() => { setDomain('devops'); setTrack('All') }}>🛠️ DevOps</button>
          </div>
        </div>
        <div className="tut-filter-group">
          <span className="tut-filter-label">Track</span>
          <div className="tut-filter-row">
            {trackPills.map(t => (
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
        {showDevOpsSoon ? (
          <div className="tut-soon">
            <div className="tut-soon-banner reveal">
              <span className="tut-soon-emoji">🛠️</span>
              <div>
                <h3 className="tut-soon-title">The DevOps journey is being written</h3>
                <p className="tut-soon-sub">Same story-driven style as the A.I. track — every concept paired with something you can actually run. Here’s the planned arc:</p>
              </div>
            </div>
            <div className="tut-grid">
              {DOMAINS.devops.tracks.map((t, i) => (
                <article key={t} className="tut-card tc-green tc-ghost reveal" style={{ animationDelay: `${i * 0.08}s` }}>
                  <div className="tc-top">
                    <span className="tc-emoji">🛠️</span>
                    <span className="tc-track tc-track-green">DevOps</span>
                  </div>
                  <h2 className="tc-title">{t}</h2>
                  <p className="tc-excerpt">Coming soon — drafting now. Hands-on, beginner-friendly, no prior ops experience assumed.</p>
                  <div className="tc-footer">
                    <span className="tc-soon-pill">🚧 In drafting</span>
                  </div>
                </article>
              ))}
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="tut-empty">
            <span>🤷</span>
            <p>{tutorials.length === 0
              ? 'No tutorials published yet — drop a folder into /tuts to add one.'
              : 'No tutorials match those filters yet.'}</p>
          </div>
        ) : (
          <div className="tut-grid">
            {filtered.map((tut, i) => {
              const color = TRACK_COLOR[tut.track] || 'cyan'
              return (
                <article key={tut.slug} className={`tut-card tc-${color} reveal`} style={{ animationDelay: `${i * 0.07}s` }}>
                  {tut.cover && (
                    <div className="tc-cover">
                      <img src={tut.cover} alt={tut.title} loading="lazy" />
                    </div>
                  )}

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
