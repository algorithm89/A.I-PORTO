import { Link } from 'react-router-dom'
import HexGrid from '../components/HexGrid'
import './CartoonBlogPage.css'

import pic13 from '../assets/PIC13.png'
import pic14 from '../assets/PIC14.png'
import pic15 from '../assets/PIC15.jpg'
import pic16 from '../assets/PIC16.png'
import pic18 from '../assets/PIC18.png'
import pic19 from '../assets/PIC19.png'
import pic20 from '../assets/PIC20.png'

const POSTS = [
  {
    id: 1,
    color: 'yellow',
    emoji: '🎨',
    title: 'What Avatar: The Last Airbender Taught Me About Storytelling',
    excerpt: 'Every scene earns its place. Every character arc is paid off. There is a reason writers still study this show — it is a masterclass in economy of storytelling.',
    date: 'March 18, 2026',
    readTime: '6 min read',
    tags: ['animation', 'storytelling', 'avatar'],
    img: pic13,
  },
  {
    id: 2,
    color: 'yellow',
    emoji: '⚡',
    title: 'X-Men 97 and the Return of Earnest Storytelling',
    excerpt: 'In a world of ironic detachment, X-Men 97 just goes for it. Big emotions, real stakes, and characters who actually mean what they say. Here is why that matters right now.',
    date: 'March 5, 2026',
    readTime: '5 min read',
    tags: ['xmen', 'animation', 'review'],
    img: pic14,
  },
  {
    id: 3,
    color: 'yellow',
    emoji: '🎸',
    title: 'Legend of Calamity Jane — The Forgotten Gem',
    excerpt: 'A gritty, stylish western cartoon that disappeared after one season. Why this show deserved better and why its art direction still holds up today.',
    date: 'February 20, 2026',
    readTime: '4 min read',
    tags: ['western', 'animation', 'hidden gem'],
    img: pic15,
  },
  {
    id: 4,
    color: 'yellow',
    emoji: '⚔️',
    title: 'Highlander: The Animated Series — Immortal Lessons',
    excerpt: 'An animated adaptation that somehow captured the essence of the original. Themes of mortality, honour and what it means to live forever.',
    date: 'February 12, 2026',
    readTime: '5 min read',
    tags: ['highlander', 'animation', 'classic'],
    img: pic16,
  },
  {
    id: 5,
    color: 'yellow',
    emoji: '🐉',
    title: 'Legend of Vox Machina — D&D Done Right',
    excerpt: 'What happens when a group of voice actors pour their love of Dungeons & Dragons into a show? Pure magic. Adult animation with heart.',
    date: 'February 5, 2026',
    readTime: '6 min read',
    tags: ['vox machina', 'dnd', 'animation'],
    img: pic18,
  },
  {
    id: 6,
    color: 'yellow',
    emoji: '🚀',
    title: 'Mighty Max — The 90s Show That Was Secretly Deep',
    excerpt: 'On the surface it was a toy commercial. Underneath it was a show about fate, time loops and a kid who had to face the end of everything.',
    date: 'January 28, 2026',
    readTime: '5 min read',
    tags: ['90s', 'animation', 'nostalgia'],
    img: pic19,
  },
  {
    id: 7,
    color: 'yellow',
    emoji: '🍃',
    title: 'Ninja Scroll — A Masterpiece of 90s Anime',
    excerpt: 'Before the streaming era, this film was passed around on VHS tapes. Its influence on action anime is still felt today. A deep dive into what made it special.',
    date: 'January 15, 2026',
    readTime: '7 min read',
    tags: ['anime', 'ninja scroll', 'classic'],
    img: pic20,
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
            The shows that shaped how I think about stories, art and the world.
            Reviews, deep dives and love letters to the best animated works ever made.
          </p>
        </div>
      </section>

      {/* ── Posts grid ── */}
      <section className="cartoon-grid-section container">
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


