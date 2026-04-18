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
]

export default function BlogPage() {
  return (
    <div className="blog-page">
      <TronGrid cellSize={60} color="255,45,120" radius={2.5} />

      {/* ── Hero banner ── */}
      <section className="blog-hero">
        <div className="container">
          <span className="sec-tag sec-tag-purple">🧭 Inner Compass</span>
          <h1 className="blog-hero-title">
            Stories, thoughts &amp;<br />
            <span className="gradient-text">honest reflections</span>
          </h1>
          <p className="blog-hero-sub">
            Reflections on mindset, growth and navigating life with curiosity.
            The inner journey that runs alongside the tech one.
          </p>
        </div>
      </section>

      {/* ── Posts grid ── */}
      <section className="blog-grid-section container">
        <div className="blog-grid">
          {POSTS.map(post => (
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
          <div>
            <p className="blog-cta-label">Love animated storytelling?</p>
            <h3 className="blog-cta-title">Check out the <span className="gradient-text-yellow">Cartoon Blog</span></h3>
          </div>
          <Link to="/cartoons" className="btn-neon-yellow">Cartoon Blog →</Link>
        </div>
      </section>
    </div>
  )
}

