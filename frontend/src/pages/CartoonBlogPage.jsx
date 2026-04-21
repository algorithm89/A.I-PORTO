import { Link } from 'react-router-dom'
import HexGrid from '../components/HexGrid'
import './CartoonBlogPage.css'

import pic10 from '../assets/PIC10.png'

const POSTS = [
  {
    id: 1,
    emoji: '✨',
    series: 'Neon Spirit',
    title: 'Episode I: A Blast from a Poorly Indexed Past',
    excerpt: 'In the city of Neon Hollow, a retired agent named Zero cracks open an archive that was never meant to be found — and meets an Index with strong opinions about filing systems.',
    date: 'April 20, 2026',
    readTime: '8 min read',
    tags: ['neon-spirit', 'original', 'episode-1'],
    img: pic10,
    to: '/cartoons/neon-spirit/ep1',
    live: true,
  },
  {
    id: 2,
    emoji: '🌙',
    series: 'Coming Soon',
    title: 'Story #2 — Title TBA',
    excerpt: 'A new story is being written. Check back soon.',
    date: '—',
    readTime: '—',
    tags: ['coming-soon'],
    img: null,
    to: null,
    live: false,
  },
  {
    id: 3,
    emoji: '🔥',
    series: 'Coming Soon',
    title: 'Story #3 — Title TBA',
    excerpt: 'Another adventure in the works. More details soon.',
    date: '—',
    readTime: '—',
    tags: ['coming-soon'],
    img: null,
    to: null,
    live: false,
  },
]

export default function CartoonBlogPage() {
  return (
    <div className="cartoon-page">
      <HexGrid color="255,230,0" radius={3} />

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
        {POSTS.length === 0 ? (
          <div className="cartoon-empty">
            <span className="cartoon-empty-icon">📝</span>
            <h2>No posts yet</h2>
            <p>New cartoon blog posts are coming soon — stay tuned!</p>
          </div>
        ) : (
          <div className="cartoon-grid">
            {POSTS.map(post => (
              <article key={post.id} className={`cartoon-card${!post.live ? ' cartoon-card-placeholder' : ''}`}>
                <div className="cc-img-wrap">
                  {post.img
                    ? <img src={post.img} alt={post.title} className="cc-img" loading="lazy" />
                    : <div className="cc-img-empty"><span>{post.emoji}</span></div>
                  }
                  <div className="cc-img-overlay">
                    <span className="cc-emoji">{post.emoji}</span>
                  </div>
                </div>

                <div className="cc-body">
                  <div className="cc-meta">
                    <span className="cc-series">{post.series}</span>
                    {post.date !== '—' && <><span className="cc-dot">·</span><span className="cc-date">{post.date}</span></>}
                    {post.readTime !== '—' && <><span className="cc-dot">·</span><span className="cc-read">{post.readTime}</span></>}
                  </div>

                  <h2 className="cc-title">{post.title}</h2>
                  <p className="cc-excerpt">{post.excerpt}</p>

                  <div className="cc-tags">
                    {post.tags.map(t => (
                      <span key={t} className="cc-tag">#{t}</span>
                    ))}
                  </div>

                  {post.live
                    ? <Link to={post.to} className="cc-read-btn">Read episode →</Link>
                    : <span className="cc-read-btn cc-read-btn-disabled">Coming soon…</span>
                  }
                </div>
              </article>
            ))}
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


