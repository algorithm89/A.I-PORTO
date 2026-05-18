import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import HexTronGrid from '../components/HexTronGrid'
import { requireAuth } from '../lib/auth'
import './CartoonBlogPage.css'

import pic10 from '../assets/PIC10.webp'

const API = import.meta.env.VITE_API_URL || ''

function seriesSlug(series) {
  return (series || '').toLowerCase().trim().replace(/\s+/g, '-')
}

function formatDate(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  if (isNaN(d.getTime())) return ''
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

export default function CartoonBlogPage() {
  const [episodes, setEpisodes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`${API}/api/episodes/summaries`)
        if (!res.ok) throw new Error(`Server returned ${res.status}`)
        const data = await res.json()
        data.sort((a, b) => (a.episodeNumber || 0) - (b.episodeNumber || 0))
        setEpisodes(data)
      } catch (e) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <div className="cartoon-page">
      <HexTronGrid cellSize={44} color="255,230,0" radius={2.8} />

      {/* ── Hero ── */}
      <section className="cartoon-hero">
        <div className="container">
          <span className="sec-tag sec-tag-yellow">🎨 Cartoon Blog</span>
          <h1 className="cartoon-hero-title">
            Cartoons, anime &amp;<br />
            <span className="gradient-text-yellow">animated storytelling</span>
          </h1>
          <p className="cartoon-hero-sub">
            Original scripts, stories and love letters to the best animated works ever made.
            Written by BublikStudios — new episodes drop when inspiration strikes.
          </p>
        </div>
      </section>

      {/* ── Posts grid ── */}
      <section className="cartoon-grid-section container">
        {loading ? (
          <div className="cartoon-empty">
            <span className="cartoon-empty-icon">⏳</span>
            <p>Loading episodes…</p>
          </div>
        ) : error ? (
          <div className="cartoon-empty">
            <span className="cartoon-empty-icon">⚠️</span>
            <h2>Couldn't load episodes</h2>
            <p>{error}</p>
          </div>
        ) : episodes.length === 0 ? (
          <div className="cartoon-empty">
            <span className="cartoon-empty-icon">📝</span>
            <h2>No episodes yet</h2>
            <p>New cartoon blog episodes are coming soon — stay tuned!</p>
          </div>
        ) : (
          <div className="cartoon-grid">
            {episodes.map(ep => {
              const to = `/cartoons/${seriesSlug(ep.series)}/ep/${ep.episodeNumber}/ch/1`
              const date = formatDate(ep.createdAt)
              return (
                <article key={ep.id} className="cartoon-card">
                  <div className="cc-img-wrap">
                    <img src={pic10} alt={ep.title} className="cc-img" loading="lazy" />
                    <div className="cc-img-overlay">
                      <span className="cc-emoji">✨</span>
                    </div>
                  </div>

                  <div className="cc-body">
                    <div className="cc-meta">
                      <span className="cc-series">{ep.series}</span>
                      {date && <><span className="cc-dot">·</span><span className="cc-date">{date}</span></>}
                    </div>

                    <h2 className="cc-title">{ep.title}</h2>
                    {ep.subtitle && <p className="cc-excerpt">{ep.subtitle}</p>}

                    <a
                      href={to}
                      className="cc-read-btn"
                      onClick={e => { e.preventDefault(); if (requireAuth()) window.location.href = to }}
                    >
                      Read episode →
                    </a>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </section>

      {/* ── CTA ── */}
      <section className="cartoon-cta container">
        <div className="cartoon-cta-inner neon-border-pink">
          <div>
            <p className="cartoon-cta-label">Looking for personal reflections &amp; growth writing?</p>
            <h3 className="cartoon-cta-title">Visit the <span className="gradient-text">Inner Compass Blog</span></h3>
          </div>
          <Link to="/blog" className="btn-neon-pink">Go to Blog →</Link>
        </div>
      </section>
    </div>
  )
}
