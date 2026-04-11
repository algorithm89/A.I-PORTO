import { useState } from 'react'
import { Link } from 'react-router-dom'
import TriGrid3D from '../components/TriGrid3D'
import './TutorialsPage.css'

const TUTORIALS = [
  // ── Math & Foundations
  {
    id: 1,
    track: 'Foundations',
    color: 'cyan',
    emoji: '🧮',
    level: 'Beginner',
    title: 'Why Linear Algebra Actually Matters for AI',
    excerpt: 'Vectors, matrices, dot products — these are not abstract maths. They are literally how neural networks compute. Let\'s make it visual and real.',
    duration: '12 min',
    tags: ['linear algebra', 'math', 'foundations'],
  },
  {
    id: 2,
    track: 'Foundations',
    color: 'cyan',
    emoji: '📊',
    level: 'Beginner',
    title: 'Probability & Statistics for Machine Learning',
    excerpt: 'Every ML model is making probabilistic guesses. This guide covers the distributions, Bayes theorem and intuitions you need without drowning in notation.',
    duration: '15 min',
    tags: ['statistics', 'probability', 'math'],
  },
  // ── Python & Tools
  {
    id: 3,
    track: 'Python & Tools',
    color: 'yellow',
    emoji: '🐍',
    level: 'Beginner',
    title: 'Python for ML — What You Actually Need to Know',
    excerpt: 'Skip the fluff. This covers NumPy, Pandas and Matplotlib with real examples. No toy demos — just the patterns you will use over and over.',
    duration: '18 min',
    tags: ['python', 'numpy', 'pandas'],
  },
  {
    id: 4,
    track: 'Python & Tools',
    color: 'yellow',
    emoji: '⚙️',
    level: 'Intermediate',
    title: 'Setting Up a Local ML Dev Environment',
    excerpt: 'Virtual environments, Jupyter notebooks, GPU setup and version pinning. Get this right once and you will never fight your environment again.',
    duration: '10 min',
    tags: ['python', 'setup', 'tools'],
  },
  // ── Machine Learning
  {
    id: 5,
    track: 'Machine Learning',
    color: 'pink',
    emoji: '🤖',
    level: 'Beginner',
    title: 'Your First ML Model — Predict House Prices',
    excerpt: 'Train a real regression model with scikit-learn in under 20 lines. Understand what the model is actually doing under the hood, not just calling .fit().',
    duration: '20 min',
    tags: ['scikit-learn', 'regression', 'beginner'],
  },
  {
    id: 6,
    track: 'Machine Learning',
    color: 'pink',
    emoji: '🧠',
    level: 'Intermediate',
    title: 'What is a Neural Network, Really?',
    excerpt: 'No black boxes. We build one from scratch with just NumPy — forward pass, backprop, gradient descent. You will never fear the word "weights" again.',
    duration: '25 min',
    tags: ['neural network', 'numpy', 'deep learning'],
  },
  // ── MLOps
  {
    id: 7,
    track: 'MLOps',
    color: 'purple',
    emoji: '🚀',
    level: 'Intermediate',
    title: 'MLOps 101 — What It Is and Why It Matters',
    excerpt: 'The gap between a notebook experiment and a production model is massive. MLOps is the discipline that bridges it. Here is a clear map of the landscape.',
    duration: '14 min',
    tags: ['mlops', 'production', 'overview'],
  },
  {
    id: 8,
    track: 'MLOps',
    color: 'purple',
    emoji: '📦',
    level: 'Intermediate',
    title: 'Containerising Your ML Model with Docker',
    excerpt: 'Package your model so it runs identically everywhere — local, cloud, CI/CD. Step-by-step Dockerfile walkthrough with a real scikit-learn model.',
    duration: '22 min',
    tags: ['docker', 'mlops', 'deployment'],
  },
  // ── Local AI
  {
    id: 9,
    track: 'Local AI',
    color: 'cyan',
    emoji: '💻',
    level: 'Beginner',
    title: 'Run Your Own AI Locally with Ollama',
    excerpt: 'No API keys, no cloud costs, no data leaving your machine. Install Ollama, pull Llama 3, and have a local LLM running in under 10 minutes.',
    duration: '8 min',
    tags: ['ollama', 'local AI', 'llm'],
  },
]

const TRACKS = ['All', 'Foundations', 'Python & Tools', 'Machine Learning', 'MLOps', 'Local AI']
const LEVELS  = ['All Levels', 'Beginner', 'Intermediate', 'Advanced']

export default function TutorialsPage() {
  const [track,  setTrack]  = useState('All')
  const [level,  setLevel]  = useState('All Levels')

  const filtered = TUTORIALS.filter(t => {
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
            Honest, practical guides — from the absolute basics of maths right through to
            deploying ML models in production. No fluff, no imposter syndrome required.
          </p>
          <div className="tut-stats">
            <div className="tut-stat"><span className="tut-stat-num">{TUTORIALS.length}</span><span className="tut-stat-label">Tutorials</span></div>
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
            <p>No tutorials match those filters yet — more coming soon!</p>
          </div>
        ) : (
          <div className="tut-grid">
            {filtered.map(tut => (
              <article key={tut.id} className={`tut-card tc-${tut.color}`}>
                <div className="tc-top">
                  <span className="tc-emoji">{tut.emoji}</span>
                  <div className="tc-top-right">
                    <span className={`tc-track tc-track-${tut.color}`}>{tut.track}</span>
                    <span className={`tc-level tc-level-${tut.level.toLowerCase()}`}>{tut.level}</span>
                  </div>
                </div>

                <h2 className="tc-title">{tut.title}</h2>
                <p className="tc-excerpt">{tut.excerpt}</p>

                <div className="tc-footer">
                  <div className="tc-tags">
                    {tut.tags.map(tag => (
                      <span key={tag} className={`tc-tag tc-tag-${tut.color}`}>#{tag}</span>
                    ))}
                  </div>
                  <div className="tc-actions">
                    <span className="tc-duration">⏱ {tut.duration}</span>
                    <a href="#" className={`tc-btn tc-btn-${tut.color}`}>Read →</a>
                  </div>
                </div>
              </article>
            ))}
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

