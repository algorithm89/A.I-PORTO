import { useState } from 'react'
import { Link } from 'react-router-dom'
import TriGrid3D from '../components/TriGrid3D'
import './TutorialsPage.css'

const TUTORIALS = [
  // ── 1. Math for AI
  {
    id: 1,
    track: 'Math for AI',
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
    track: 'Math for AI',
    color: 'cyan',
    emoji: '📊',
    level: 'Beginner',
    title: 'Probability & Statistics for Machine Learning',
    excerpt: 'Every ML model is making probabilistic guesses. This guide covers distributions, Bayes theorem and the intuitions you need without drowning in notation.',
    duration: '15 min',
    tags: ['statistics', 'probability', 'math'],
  },
  {
    id: 3,
    track: 'Math for AI',
    color: 'cyan',
    emoji: '📐',
    level: 'Intermediate',
    title: 'Calculus for Deep Learning — Gradients Made Simple',
    excerpt: 'Backpropagation is just the chain rule. This tutorial walks through derivatives, partial derivatives and gradient descent with clear visual examples.',
    duration: '18 min',
    tags: ['calculus', 'gradients', 'deep learning'],
  },

  // ── 2. Titanic ML Project
  {
    id: 4,
    track: 'Titanic Project',
    color: 'pink',
    emoji: '🚢',
    level: 'Beginner',
    title: 'Titanic Survival Prediction — Your First Real ML Project',
    excerpt: 'The classic Kaggle challenge. Load the data, explore it visually, clean missing values, and train your first classifier. Step by step, no shortcuts.',
    duration: '25 min',
    tags: ['titanic', 'kaggle', 'classification'],
  },
  {
    id: 5,
    track: 'Titanic Project',
    color: 'pink',
    emoji: '🔍',
    level: 'Beginner',
    title: 'Titanic EDA — What the Data Actually Tells You',
    excerpt: 'Before you train anything, look at the data. Survival by class, age, sex, fare — the patterns are fascinating and they guide every feature engineering decision.',
    duration: '15 min',
    tags: ['EDA', 'pandas', 'visualization'],
  },
  {
    id: 6,
    track: 'Titanic Project',
    color: 'pink',
    emoji: '🎯',
    level: 'Intermediate',
    title: 'Titanic — Feature Engineering & Model Comparison',
    excerpt: 'Go beyond the basics. Create new features from names, cabins and tickets. Compare Logistic Regression, Random Forest and XGBoost. See which one wins and why.',
    duration: '30 min',
    tags: ['feature engineering', 'xgboost', 'model comparison'],
  },

  // ── 3. Biometric System
  {
    id: 7,
    track: 'Biometric System',
    color: 'purple',
    emoji: '🔐',
    level: 'Intermediate',
    title: 'Building a Biometric Authentication System with Python',
    excerpt: 'Face recognition, fingerprint matching, voice identification — how biometric systems actually work under the hood. We build one from scratch.',
    duration: '35 min',
    tags: ['biometrics', 'face recognition', 'security'],
  },
  {
    id: 8,
    track: 'Biometric System',
    color: 'purple',
    emoji: '👁️',
    level: 'Intermediate',
    title: 'Face Detection & Recognition with OpenCV and dlib',
    excerpt: 'Detect faces in real-time, extract embeddings, and match identities. A practical walkthrough using OpenCV, dlib and face_recognition library.',
    duration: '28 min',
    tags: ['opencv', 'face detection', 'dlib'],
  },
  {
    id: 9,
    track: 'Biometric System',
    color: 'purple',
    emoji: '🏗️',
    level: 'Advanced',
    title: 'Deploying a Biometric API with FastAPI & Docker',
    excerpt: 'Turn your biometric model into a production-ready REST API. Authentication flow, image upload, matching endpoint — containerised and ready to ship.',
    duration: '40 min',
    tags: ['fastapi', 'docker', 'deployment'],
  },

  // ── 4. Accountability Bot (Twilio + GPT)
  {
    id: 10,
    track: 'Accountability Bot',
    color: 'yellow',
    emoji: '📱',
    level: 'Intermediate',
    title: 'Build an Accountability Bot with Twilio & GPT',
    excerpt: 'A WhatsApp bot that checks in on you daily, tracks your goals, and uses GPT to give you personalised encouragement. The ultimate AI accountability partner.',
    duration: '35 min',
    tags: ['twilio', 'gpt', 'whatsapp'],
  },
  {
    id: 11,
    track: 'Accountability Bot',
    color: 'yellow',
    emoji: '🤖',
    level: 'Intermediate',
    title: 'Integrating OpenAI GPT for Smart Conversations',
    excerpt: 'Connect your bot to GPT-4. Craft system prompts that make it an encouraging coach — not just a chatbot. Handle context, memory and conversation flow.',
    duration: '25 min',
    tags: ['openai', 'prompt engineering', 'chatbot'],
  },
  {
    id: 12,
    track: 'Accountability Bot',
    color: 'yellow',
    emoji: '🚀',
    level: 'Advanced',
    title: 'Deploying Your Twilio Bot to Production',
    excerpt: 'Webhooks, ngrok for testing, then deploy to a real server. Add scheduled messages, goal tracking database, and weekly progress reports via WhatsApp.',
    duration: '30 min',
    tags: ['deployment', 'webhooks', 'scheduling'],
  },
]

const TRACKS = ['All', 'Math for AI', 'Titanic Project', 'Biometric System', 'Accountability Bot']
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
            From the math foundations to real-world projects — Titanic predictions,
            biometric systems and an AI accountability bot. No fluff, no imposter syndrome required.
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

