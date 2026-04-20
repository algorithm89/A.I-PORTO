import { Link } from 'react-router-dom'
import HexGrid from '../components/HexGrid'
import './CartoonBlogPage.css'

export default function CartoonBlogPage() {
  /* Posts will be added here or fetched from the backend later */
  const POSTS = []

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
            The shows that shaped how I think about stories, art and the world.
            Reviews, deep dives and love letters to the best animated works ever made.
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
              <article key={post.id} className="cartoon-card">
                <div className="cc-img-wrap">
                  <img src={post.img} alt={post.title} className="cc-img" />
                  <div className="cc-img-overlay">
                    <span className="cc-emoji">{post.emoji}</span>
                  </div>
                </div>

                <div className="cc-body">
                  <div className="cc-meta">
                    <span className="cc-date">{post.date}</span>
                    <span className="cc-dot">·</span>
                    <span className="cc-read">{post.readTime}</span>
                  </div>

                  <h2 className="cc-title">{post.title}</h2>
                  <p className="cc-excerpt">{post.excerpt}</p>

                  <div className="cc-tags">
                    {post.tags.map(t => (
                      <span key={t} className="cc-tag">#{t}</span>
                    ))}
                  </div>

                  <a href="#" className="cc-read-btn">Read post →</a>
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


