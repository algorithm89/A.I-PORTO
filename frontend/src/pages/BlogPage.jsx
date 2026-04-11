import { useState } from 'react'
import { Link } from 'react-router-dom'
import TronGrid from '../components/TronGrid'
import './BlogPage.css'

const POSTS = [
  {
    id: 1,
    category: 'Inner Compass',
    color: 'purple',
    emoji: '🧭',
    title: 'Why I Started Writing Again After Years of Silence',
    excerpt: 'There is something uncomfortable about putting your thoughts into words. It forces honesty. But after years of consuming information without reflecting, I picked up the pen again — and everything changed.',
    date: 'March 22, 2026',
    readTime: '5 min read',
    tags: ['mindset', 'writing', 'growth'],
  },
  {
    id: 2,
    category: 'Inner Compass',
    color: 'purple',
    emoji: '🧭',
    title: 'The Discipline Trap — Why Motivation is Not the Enemy',
    excerpt: 'We obsess over motivation but ignore the quiet systems that carry us forward. This is what I learned from building habits while learning AI and animation at the same time.',
    date: 'March 15, 2026',
    readTime: '7 min read',
    tags: ['discipline', 'habits', 'mindset'],
  },
  {
    id: 3,
    category: 'Inner Compass',
    color: 'purple',
    emoji: '🧭',
    title: 'Learning to Sit With Not Knowing',
    excerpt: 'Machine learning humbled me. I thought I understood maths. I thought I understood code. Turns out the best thing you can do is get comfortable being a beginner again.',
    date: 'March 8, 2026',
    readTime: '4 min read',
    tags: ['learning', 'mindset', 'AI'],
  },
  {
    id: 4,
    category: 'Cartoon Blog',
    color: 'yellow',
    emoji: '🎨',
    title: 'What Avatar: The Last Airbender Taught Me About Storytelling',
    excerpt: 'Every scene earns its place. Every character arc is paid off. There is a reason writers still study this show — it is a masterclass in economy of storytelling.',
    date: 'March 18, 2026',
    readTime: '6 min read',
    tags: ['animation', 'storytelling', 'avatar'],
  },
  {
    id: 5,
    category: 'Cartoon Blog',
    color: 'yellow',
    emoji: '🎨',
    title: 'X-Men 97 and the Return of Earnest Storytelling',
    excerpt: 'In a world of ironic detachment, X-Men 97 just goes for it. Big emotions, real stakes, and characters who actually mean what they say. Here is why that matters right now.',
    date: 'March 5, 2026',
    readTime: '5 min read',
    tags: ['xmen', 'animation', 'review'],
  },
  {
    id: 6,
    category: 'About',
    color: 'pink',
    emoji: '✨',
    title: 'Why I Built BublikStudios',
    excerpt: 'A place where AI tutorials, cartoon obsessions and personal growth can live side by side. A bit unusual? Yes. But that is kind of the point.',
    date: 'February 28, 2026',
    readTime: '3 min read',
    tags: ['about', 'intro', 'studio'],
  },
]

const CATEGORIES = ['All', 'Inner Compass', 'Cartoon Blog', 'About']

export default function BlogPage() {
  const [active, setActive] = useState('All')

  const filtered = active === 'All' ? POSTS : POSTS.filter(p => p.category === active)

  return (
    <div className="blog-page">
      <TronGrid cellSize={60} color="255,45,120" radius={2.5} />

      {/* ── Hero banner ── */}
      <section className="blog-hero">
        <div className="container">
          <span className="sec-tag sec-tag-pink">📖 Blog</span>
          <h1 className="blog-hero-title">
            Stories, thoughts &amp;<br />
            <span className="gradient-text">honest reflections</span>
          </h1>
          <p className="blog-hero-sub">
            Inner compass writing, cartoon love letters and the occasional "here's what I learned the hard way" post.
          </p>
        </div>
      </section>

      {/* ── Category filter ── */}
      <div className="blog-filters container">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            className={`filter-btn ${active === cat ? 'filter-active' : ''}`}
            onClick={() => setActive(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* ── Posts grid ── */}
      <section className="blog-grid-section container">
        <div className="blog-grid">
          {filtered.map(post => (
            <article key={post.id} className={`blog-card bc-${post.color}`}>
              {/* Placeholder image area */}
              <div className="bc-img-placeholder">
                <span className="bc-placeholder-emoji">{post.emoji}</span>
                <span className="bc-category">{post.category}</span>
              </div>

              <div className="bc-body">
                <div className="bc-meta">
                  <span className="bc-date">{post.date}</span>
                  <span className="bc-dot">·</span>
                  <span className="bc-read">{post.readTime}</span>
                </div>

                <h2 className="bc-title">{post.title}</h2>
                <p className="bc-excerpt">{post.excerpt}</p>

                <div className="bc-tags">
                  {post.tags.map(t => (
                    <span key={t} className={`bc-tag bc-tag-${post.color}`}>#{t}</span>
                  ))}
                </div>

                <a href="#" className={`bc-read-btn bc-btn-${post.color}`}>Read post →</a>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="blog-cta container">
        <div className="blog-cta-inner neon-border-cyan">
          <p className="blog-cta-label">Looking for AI &amp; MLOps tutorials?</p>
          <h3 className="blog-cta-title">Check out the <span className="gradient-text">Tutorials section</span></h3>
          <Link to="/tutorials" className="btn-neon-cyan">Go to Tutorials →</Link>
        </div>
      </section>
    </div>
  )
}

